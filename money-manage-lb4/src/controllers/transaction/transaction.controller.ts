import * as core from '@loopback/core';
import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import * as Model from '../../models';
import * as Repository from '../../repositories';
import * as CustomResponseSchema from '../../utils/custom-response-schema';
import * as CustomRequestBody from '../../utils/custom-request-body';
import * as UseCaseKey from '../../domain/usecase/binding_key.usecase';
import * as UseCase from '../../domain/usecase/index';
import * as Infrastructure from '../../infrastructure/index';
import * as InfrastructureKey from '../../infrastructure/binding_key.infrastructure';
import {RestBindings} from '@loopback/rest';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {authenticate} from '@loopback/authentication';
import {BaseController} from '../base.controller';

export class TransactionController extends BaseController {
  constructor(
    //* REPO
    @repo.repository(Repository.TransactionRepository)
    public transactionRepository: Repository.TransactionRepository,

    //* Use case
    @core.inject(UseCaseKey.CREATE_TRANSACTION_USE_CASE)
    private createTransactionUseCase: UseCase.CreateTransactionUseCase,
    @core.inject(UseCaseKey.UPDATE_TRANSACTION_USE_CASE)
    private updateTransactionUseCase: UseCase.UpdateTransactionUseCase,
    @core.inject(UseCaseKey.DELETE_TRANSACTION_USE_CASE)
    private deleteTransactionUseCase: UseCase.DeleteTransactionUseCase,

    //* Http
    @core.inject(RestBindings.Http.REQUEST)
    private req: ExpressRequest,
    @core.inject(RestBindings.Http.RESPONSE)
    private res: ExpressResponse,

    //* Service
    @core.inject(InfrastructureKey.UPLOAD_FILE_MULTER_SERVICE)
    private multerService: Infrastructure.UploadFileMulterService,
    @core.inject(InfrastructureKey.SYNC_NOTIFIER_SERVICE)
    private syncNotifyService: Infrastructure.SyncNotifyService,
  ) {
    super();
  }

  //* -------------------------------------------- GET --------------------------------------------
  @rest.get('get/transactions/count')
  @rest.response(
    200,
    CustomResponseSchema.getCustomCountResponseSchema(
      'Transaction model count',
    ),
  )
  async count(
    @rest.param.where(Model.Transaction) where?: repo.Where<Model.Transaction>,
  ): Promise<repo.Count> {
    return this.transactionRepository.count(where);
  }

  @rest.get('get/transactions/load_by_month')
  @authenticate('jwt')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(
      Model.Transaction,
      'Array of Transaction model instances',
      true,
      true,
    ),
  )
  async find(
    @rest.param.query.number('page') page: number,
    @rest.param.query.number('limit_count') limit_count: number,
    @rest.param.query.number('month') month: number,
    @rest.param.query.number('year') year: number,
    @rest.param.query.string('type') type?: string,
  ): Promise<Model.Transaction[]> {
    const user_id = await this.extractUserIdFromToken();

    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const whereFilter: any = {
      user_id,
      transaction_at: {
        between: [startDate, endDate],
      },
      is_deleted: {neq: true},
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
  //* -------------------------------------------- END GET ---------------------------------------------

  //Todo: ----------------------------------------- POST -----------------------------------------------
  @rest.post('post/transactions')
  @authenticate('jwt')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(
      Model.Transaction,
      'Transaction model instance',
    ),
  )
  async create(
    @CustomRequestBody.MultipartFormDataRequest({
      description: 'Upload Transaction',
      additionalProps: true,
    })
    uploadTransactionMultipart: any,
  ): Promise<any> {
    const user_id = await this.extractUserIdFromToken();

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
  //Todo: -------------------------------------------- END POST --------------------------------------------

  //? ------------------------------------------------- PATCH -------------------------------------------------
  @rest.patch('patch/transactions/{id}')
  @authenticate('jwt')
  @rest.response(204, {
    description: 'Transaction PATCH success',
  })
  async updateById(
    @rest.param.path.string('id') id: string,
    @CustomRequestBody.MultipartFormDataRequest({
      description: 'Update Transaction',
      additionalProps: true,
    })
    uploadTransactionMultipart: any,
  ): Promise<any> {
    const user_id = await this.extractUserIdFromToken();

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

  //? ------------------------------------------------- END PATCH -------------------------------------------------

  //! -------------------------------------------------- DELETE ---------------------------------------------------
  @rest.del('delete/transactions/{id}')
  @authenticate('jwt')
  @rest.response(204, {
    description: 'Transaction DELETE success',
  })
  async deleteById(@rest.param.path.string('id') id: string): Promise<any> {
    const user_id = await this.extractUserIdFromToken();
    await this.deleteTransactionUseCase.execute(id, user_id);
    // Notify websocket
    this.syncNotifyService.notifySyncCompleted(user_id, 'transaction');

    return {message: 'Success'};
  }
  //! ----------------------------------------------- END DELETE ---------------------------------------------------
}
