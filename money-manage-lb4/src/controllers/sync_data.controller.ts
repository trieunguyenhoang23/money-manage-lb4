import {inject} from '@loopback/core';
import {Getter} from '@loopback/core';
import {post, getModelSchemaRef} from '@loopback/rest';
import {Category, Reminder, Transaction} from '../models';
import {
  getCustomRequestBody,
  MultipartFormDataRequest,
} from './utils/custom-request-body';
import * as usecase from '../domain/usecase/binding_key.usecase';
import {SyncCategoryDataUseCase} from '../domain/usecase/sync/sync-user-data.usecase';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {authenticate} from '@loopback/authentication';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {UploadFileS3Service} from '../infrastructure/file/upload-file-s3.service';
import {UploadFileMulterService} from '../infrastructure/file/upload-file_multer.service';
import * as infra from '../infrastructure/binding_key.infrastructure';
import {RestBindings} from '@loopback/rest';
import {SyncTransactionDataUseCase} from '../domain/usecase/sync/sync-transaction-data.usecase';

export class SyncDataController {
  constructor(
    @inject(usecase.SYNC_CATEGORY_DATA_USECASE)
    private syncUserDataUseCase: SyncCategoryDataUseCase,
    @inject(usecase.SYNC_TRANSACTION_DATA_USECASE)
    private syncTransactionUseCase: SyncTransactionDataUseCase,
    @inject(RestBindings.Http.REQUEST)
    private req: ExpressRequest,
    @inject(RestBindings.Http.RESPONSE)
    private res: ExpressResponse,
    @inject(infra.UPLOAD_FILE_S3_SERVICE)
    private s3Service: UploadFileS3Service,
    @inject(infra.UPLOAD_FILE_MULTER_SERVICE)
    private multerService: UploadFileMulterService,
  ) {}

  @post('post/sync/batch-category')
  @authenticate('jwt')
  async syncAll(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @getCustomRequestBody(null, {
      title: 'Sync Batch data Cate',
      extraProps: {
        categories: {
          type: 'array',
          items: getModelSchemaRef(Category, {
            exclude: ['user_id'],
            partial: true,
          }),
        },
      },
    })
    data: {
      categories: Category[];
    },
  ): Promise<{status: string}> {
    const currentUserProfile = await getUser();

    // Extract the ID
    const user_id = currentUserProfile[securityId];

    await this.syncUserDataUseCase.execute(data.categories, user_id);

    return {status: 'Sync successful'};
  }

  @post('post/sync/batch-transaction')
  @authenticate('jwt')
  async syncAllTransaction(
    @MultipartFormDataRequest({
      description: 'Upload Multiple Transactions with Images',
      additionalProps: true,
    })
    unusedPayload: any,
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
  ): Promise<any> {
    const currentUserProfile = await getUser();
    const user_id = currentUserProfile[securityId];

    const multerFiles = await this.multerService.upload(
      'image_description',
      this.req,
      this.res,
    );

    const body = (this.req as any).body ?? {};

    let transactionData: any[] = [];
    try {
      transactionData =
        typeof body.transactions === 'string'
          ? JSON.parse(body.transactions)
          : body.transactions;
    } catch (e) {
      throw new Error('Invalid JSON format in transactions field');
    }

    const results = await this.syncTransactionUseCase.execute(
      transactionData,
      user_id,
      multerFiles,
    );

    return results;
  }
}
