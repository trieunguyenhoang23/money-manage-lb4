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
import {CREATE_TRANSACTION_USECASE} from '../../domain/usecase/binding_key.usecase';
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
} from '../../infrastructure/binding_key.infrastructure';

export class TransactionController {
  constructor(
    @repo.repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    @inject(CREATE_TRANSACTION_USECASE)
    private createTransactionUseCase: CreateTransactionUseCase,
    @inject(RestBindings.Http.REQUEST)
    private req: ExpressRequest,
    @inject(RestBindings.Http.RESPONSE)
    private res: ExpressResponse,
    @inject(UPLOAD_FILE_S3_SERVICE)
    private s3Service: UploadFileS3Service,
    @inject(UPLOAD_FILE_MULTER_SERVICE)
    private multerService: UploadFileMulterService,
  ) {}

  //* GET
  @rest.get('get/transactions/count')
  @rest.response(200, getCustomCountResponseSchema('Transaction model count'))
  async count(
    @rest.param.where(Transaction) where?: repo.Where<Transaction>,
  ): Promise<repo.Count> {
    return this.transactionRepository.count(where);
  }

  @rest.get('get/transactions')
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
    @rest.param.filter(Transaction) filter?: repo.Filter<Transaction>,
  ): Promise<Transaction[]> {
    return this.transactionRepository.find(filter);
  }

  @rest.get('get/transactions/{id}')
  @rest.response(
    200,
    getCustomModelResponseSchema(
      Transaction,
      'Transaction model instance',
      false,
      true,
    ),
  )
  async findById(
    @rest.param.path.string('id') id: string,
    @rest.param.filter(Transaction, {exclude: 'where'})
    filter?: repo.FilterExcludingWhere<Transaction>,
  ): Promise<Transaction> {
    return this.transactionRepository.findById(id, filter);
  }

  //Todo: POST
  @rest.post('post/transactions')
  @rest.response(
    200,
    getCustomModelResponseSchema(Transaction, 'Transaction model instance'),
  )
  async create(
    @MultipartFormDataRequest({
      description: 'Upload Wallpaper',
      additionalProps: false,
    })
    uploadTransactionMultipart: any,
  ): Promise<any> {
    const uploadFileMulter = await this.multerService.upload(
      'image_description',
      this.req,
      this.res,
    );
    
    let imageDescriptionUrl: string | undefined;
    if (uploadFileMulter && uploadFileMulter.length > 0) {
      const uploadedFileS3 = await this.s3Service.uploadFileToS3(
        uploadFileMulter,
        //Folder lưu trữ trên S3
        'money-manage/image_description',
      );

      imageDescriptionUrl = uploadedFileS3.path;
    }

    const body = (this.req as any).body ?? {};

    return await this.createTransactionUseCase.execute(
      body,
      imageDescriptionUrl,
    );
  }

  //? PATCH
  @rest.patch('patch/transactions')
  @rest.response(200, {
    description: 'Transaction PATCH success count',
    content: {'application/json': {schema: repo.CountSchema}},
  })
  async updateAll(
    @getCustomRequestBody(Transaction, {partial: true})
    transaction: Transaction,
    @rest.param.where(Transaction) where?: repo.Where<Transaction>,
  ): Promise<repo.Count> {
    return this.transactionRepository.updateAll(transaction, where);
  }

  @rest.patch('patch/transactions/{id}')
  @rest.response(204, {
    description: 'Transaction PATCH success',
  })
  async updateById(
    @rest.param.path.string('id') id: string,
    @getCustomRequestBody(Transaction, {partial: true})
    transaction: Transaction,
  ): Promise<void> {
    await this.transactionRepository.updateById(id, transaction);
  }

  //Todo PUT
  @rest.put('put/transactions/{id}')
  @rest.response(204, {
    description: 'Transaction PUT success',
  })
  async replaceById(
    @rest.param.path.string('id') id: string,
    @rest.requestBody() transaction: Transaction,
  ): Promise<void> {
    await this.transactionRepository.replaceById(id, transaction);
  }

  //! DELETE
  @rest.del('delete/transactions/{id}')
  @rest.response(204, {
    description: 'Transaction DELETE success',
  })
  async deleteById(@rest.param.path.string('id') id: string): Promise<void> {
    await this.transactionRepository.deleteById(id);
  }
}
