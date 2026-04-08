import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import {Transaction} from '../../models';
import {TransactionRepository} from '../../repositories';
import {
  getCustomCountResponseSchema,
  getCustomModelResponseSchema,
} from '../utils/custom-response-schema';
import {
  getCustomRequestBody,
  MultipartFormDataRequest,
} from '../utils/custom-request-body';
import {inject} from '@loopback/core';
import {
  CREATE_TRANSACTION_USECASE,
  UPDATE_TRANSACTION_USECASE,
} from '../../domain/usecase/binding_key.usecase';
import {CreateTransactionUseCase} from '../../domain/usecase/transaction/create_transaction.usecase';
import {RestBindings} from '@loopback/rest';

import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {UploadFileS3Service} from '../../infrastructure/file/upload-file-s3.service';
import {UploadFileMulterService} from '../../infrastructure/file/upload-file_multer.service';
import {
  UPLOAD_FILE_S3_SERVICE,
  UPLOAD_FILE_MULTER_SERVICE,
  SYNC_NOTIFIER_SERVICE,
} from '../../infrastructure/binding_key.infrastructure';
import {authenticate} from '@loopback/authentication';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {UpdateTransactionUseCase} from '../../domain/usecase/transaction/update_transaction.usecase';
import {SyncNotifyService} from '../../infrastructure/socket/sync_notifier.service';

export class TransactionController {
  constructor(
    // REPO
    @repo.repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    // Use case
    @inject(CREATE_TRANSACTION_USECASE)
    private createTransactionUseCase: CreateTransactionUseCase,
    @inject(UPDATE_TRANSACTION_USECASE)
    private updateTransactionUseCase: UpdateTransactionUseCase,
    // Http
    @inject(RestBindings.Http.REQUEST)
    private req: ExpressRequest,
    @inject(RestBindings.Http.RESPONSE)
    private res: ExpressResponse,
    // Service
    @inject(UPLOAD_FILE_S3_SERVICE)
    private s3Service: UploadFileS3Service,
    @inject(UPLOAD_FILE_MULTER_SERVICE)
    private multerService: UploadFileMulterService,
    @inject(SYNC_NOTIFIER_SERVICE)
    private syncNotifyService: SyncNotifyService,
  ) {}

  //* GET
  @rest.get('get/transactions/count')
  @rest.response(200, getCustomCountResponseSchema('Transaction model count'))
  async count(
    @rest.param.where(Transaction) where?: repo.Where<Transaction>,
  ): Promise<repo.Count> {
    return this.transactionRepository.count(where);
  }

  @rest.get('get/transactions/load_by_month')
  @authenticate('jwt')
  @rest.response(
    200,
    getCustomModelResponseSchema(
      Transaction,
      'Array of Transaction model instances',
      true,
      true,
    ),
  )
  async find(
    @inject.getter(SecurityBindings.USER) getUser: repo.Getter<UserProfile>,
    @rest.param.query.number('page') page: number,
    @rest.param.query.number('limit_count') limit_count: number,
    @rest.param.query.number('month') month: number,
    @rest.param.query.number('year') year: number,
    @rest.param.query.string('type') type?: string,
  ): Promise<Transaction[]> {
    const currentUserProfile = await getUser();

    // Extract the ID
    const user_id = currentUserProfile[securityId];

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const whereFilter: any = {
      user_id,
      transaction_at: {
        between: [startDate, endDate],
      },
    };

    if (type) {
      whereFilter.type = type;
    }

    return this.transactionRepository.find({
      limit: limit_count,
      skip: page * limit_count,
      order: ['transaction_at desc'],
      where: whereFilter,
      include: [
        {
          relation: 'category',
        },
      ],
    });
  }

  //Todo: POST
  @rest.post('post/transactions')
  @authenticate('jwt')
  @rest.response(
    200,
    getCustomModelResponseSchema(Transaction, 'Transaction model instance'),
  )
  async create(
    @MultipartFormDataRequest({
      description: 'Upload Transaction',
      additionalProps: true,
    })
    uploadTransactionMultipart: any,
    @inject.getter(SecurityBindings.USER) getUser: repo.Getter<UserProfile>,
  ): Promise<any> {
    const currentUserProfile = await getUser();
    const user_id = currentUserProfile[securityId];

    const multerFiles = await this.multerService.upload(
      'image_description',
      this.req,
      this.res,
    );

    const body = (this.req as any).body ?? {};
    const newFile =
      multerFiles && multerFiles.length > 0 ? multerFiles[0] : undefined;

    const newTransaction = await this.createTransactionUseCase.execute(
      body,
      user_id,
      newFile,
    );

    // Notify websocket
    this.syncNotifyService.notifySyncCompleted(user_id, 'transaction');

    return {image_description: newTransaction.image_description};
  }

  //? PATCH
  @rest.patch('patch/transactions/{id}')
  @authenticate('jwt')
  @rest.response(204, {
    description: 'Transaction PATCH success',
  })
  async updateById(
    @rest.param.path.string('id') id: string,
    @MultipartFormDataRequest({
      description: 'Update Transaction',
      additionalProps: true,
    })
    uploadTransactionMultipart: any,
    @inject.getter(SecurityBindings.USER) getUser: repo.Getter<UserProfile>,
  ): Promise<any> {
    const user = await getUser();
    const user_id = user[securityId];

    const files = await this.multerService.upload(
      'image_description',
      this.req,
      this.res,
    );
    const newFile = files && files.length > 0 ? files[0] : undefined;

    // Notify websocket
    this.syncNotifyService.notifySyncCompleted(user_id, 'transaction');

    return await this.updateTransactionUseCase.execute(
      id,
      user_id,
      this.req.body,
      newFile,
    );
  }

  //! DELETE
  @rest.del('delete/transactions/{id}')
  @authenticate('jwt')
  @rest.response(204, {
    description: 'Transaction DELETE success',
  })
  async deleteById(
    @rest.param.path.string('id') id: string,
    @inject.getter(SecurityBindings.USER) getUser: repo.Getter<UserProfile>,
  ): Promise<any> {
    const currentUserProfile = await getUser();
    const user_id = currentUserProfile[securityId];

    const transaction = await this.transactionRepository.findOne({
      where: {id, user_id},
    });

    if (!transaction) {
      throw new rest.HttpErrors.NotFound(
        `Transaction with id ${id} not found or you don't have permission to delete it.`,
      );
    }

    if (transaction.image_description) {
      await this.s3Service.deleteFileFromS3(transaction.image_description);
    }

    await this.transactionRepository.updateById(id, {
      is_deleted: true,
      updated_at: new Date().toISOString(),
      image_description: '',
    });

    // Notify websocket
    this.syncNotifyService.notifySyncCompleted(user_id, 'transaction');

    return {message: 'Success'};
  }
}
