import {inject} from '@loopback/core';
import {Getter} from '@loopback/core';
import {post, get, getModelSchemaRef, param, response} from '@loopback/rest';
import {Category, Reminder, Transaction} from '../models';
import {
  getCustomRequestBody,
  MultipartFormDataRequest,
} from './utils/custom-request-body';
import * as usecase from '../domain/usecase/binding_key.usecase';
import {SyncCategoryDataUseCase} from '../domain/usecase/sync/sync-category-data.usecase';
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
import {getCustomModelResponseSchema} from './utils/custom-response-schema';
import {repository} from '@loopback/repository';
import {CategoryRepository, TransactionRepository} from '../repositories';

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
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  //* GET
  @get('get/transactions/sync_delta')
  @authenticate('jwt')
  @response(200, {
    description: 'Sync Delta Response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {type: 'array', items: {'x-ts-type': Transaction}},
            hasMore: {type: 'boolean'},
            serverTime: {type: 'string'},
          },
        },
      },
    },
  })
  async syncTransactionDelta(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @param.query.number('page') page: number = 0,
    @param.query.number('limit_count') limit_count: number = 20,
    @param.query.string('last_time_sync') last_time_sync?: string,
  ): Promise<{data: Transaction[]; hasMore: boolean; serverTime: string}> {
    const currentUserProfile = await getUser();
    const user_id = currentUserProfile[securityId];

    const whereFilter: any = {
      user_id: user_id,
    };

    if (last_time_sync) {
      whereFilter.updated_at = {gte: new Date(last_time_sync)};
    }

    const data = await this.transactionRepository.find({
      where: whereFilter,
      limit: limit_count,
      skip: page * limit_count,
      order: ['updated_at asc'],
      include: [{relation: 'category'}],
    });

    const hasMore = data.length === limit_count;

    // 3. Lấy thời gian Server hiện tại
    const serverTime = new Date().toISOString();

    return {
      data: data,
      hasMore: hasMore,
      serverTime: serverTime,
    };
  }

  @get('get/categories/sync_delta')
  @authenticate('jwt')
  @response(200, {
    description: 'Sync Category Delta Response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {type: 'array', items: {'x-ts-type': Category}},
            hasMore: {type: 'boolean'},
            serverTime: {type: 'string'},
          },
        },
      },
    },
  })
  async syncCateDelta(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @param.query.number('page') page: number = 0,
    @param.query.number('limit_count') limit_count: number = 20,
    @param.query.string('last_time_sync') last_time_sync?: string,
  ): Promise<{data: Category[]; hasMore: boolean; serverTime: string}> {
    const currentUserProfile = await getUser();
    const user_id = currentUserProfile[securityId];

    // Filter theo user_id (hoặc lấy category hệ thống nếu ông có chia loại)
    const whereFilter: any = {
      user_id: user_id,
    };

    // Nếu có mốc thời gian, lọc những bản ghi mới cập nhật
    if (last_time_sync && last_time_sync !== '') {
      whereFilter.updated_at = {gte: new Date(last_time_sync)};
    }

    const data = await this.categoryRepository.find({
      where: whereFilter,
      limit: limit_count,
      skip: page * limit_count,
      order: ['updated_at asc'], // Luôn dùng ASC để đảm bảo thứ tự sync
    });

    // Kiểm tra xem còn trang tiếp theo không
    const hasMore = data.length === limit_count;

    // Lấy thời gian hiện tại của Server để Flutter lưu lại
    const serverTime = new Date().toISOString();

    return {
      data: data,
      hasMore: hasMore,
      serverTime: serverTime,
    };
  }

  //Todo POST
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
