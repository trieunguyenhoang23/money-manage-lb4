import * as core from '@loopback/core';
import * as rest from '@loopback/rest';
import * as Model from '../../models';
import * as Repository from '../../repositories';
import * as UseCaseKey from '../../domain/usecase/binding_key.usecase';
import * as UseCase from '../../domain/usecase/index';
import * as Infrastructure from '../../infrastructure/index';
import * as InfrastructureKey from '../../infrastructure/binding_key.infrastructure';
import * as CustomRequestBody from '../../utils/custom-request-body';
import {RestBindings} from '@loopback/rest';
import {repository} from '@loopback/repository';
import {authenticate} from '@loopback/authentication';
import type {
  Request as ExpressRequest,
  Response as ExpressResponse,
} from 'express';
import {BaseController} from '../base.controller';

export class SyncDataController extends BaseController {
  constructor(
    //* Use case
    @core.inject(UseCaseKey.SYNC_CATEGORY_DATA_USE_CASE)
    private syncUserDataUseCase: UseCase.SyncCategoryDataUseCase,
    @core.inject(UseCaseKey.SYNC_TRANSACTION_DATA_USE_CASE)
    private syncTransactionUseCase: UseCase.SyncTransactionDataUseCase,

    //* Http
    @core.inject(RestBindings.Http.REQUEST)
    private req: ExpressRequest,
    @core.inject(RestBindings.Http.RESPONSE)
    private res: ExpressResponse,

    //* Infrastructure
    @core.inject(InfrastructureKey.UPLOAD_FILE_MULTER_SERVICE)
    private multerService: Infrastructure.UploadFileMulterService,

    //* Repository
    @repository(Repository.TransactionRepository)
    public transactionRepository: Repository.TransactionRepository,
    @repository(Repository.CategoryRepository)
    public categoryRepository: Repository.CategoryRepository,
  ) {
    super();
  }

  //* -------------------------------------------- GET --------------------------------------------
  @rest.get('get/transactions/sync_delta')
  @authenticate('jwt')
  @rest.response(200, {
    description: 'Sync Delta Response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {type: 'array', items: {'x-ts-type': Model.Transaction}},
            hasMore: {type: 'boolean'},
            serverTime: {type: 'string'},
          },
        },
      },
    },
  })
  async syncTransactionDelta(
    @rest.param.query.number('page') page: number = 0,
    @rest.param.query.number('limit_count') limit_count: number = 20,
    @rest.param.query.string('last_time_sync') last_time_sync?: string,
  ): Promise<{
    data: Model.Transaction[];
    hasMore: boolean;
    serverTime: string;
  }> {
    const user_id = await this.extractUserIdFromToken();

    const whereFilter: any = {
      user_id,
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

    const serverTime = new Date().toISOString();

    return {
      data: data,
      hasMore: hasMore,
      serverTime: serverTime,
    };
  }

  @rest.get('get/categories/sync_delta')
  @authenticate('jwt')
  @rest.response(200, {
    description: 'Sync Category Delta Response',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {type: 'array', items: {'x-ts-type': Model.Category}},
            hasMore: {type: 'boolean'},
            serverTime: {type: 'string'},
          },
        },
      },
    },
  })
  async syncCateDelta(
    @rest.param.query.number('page') page: number = 0,
    @rest.param.query.number('limit_count') limit_count: number = 20,
    @rest.param.query.string('last_time_sync') last_time_sync?: string,
  ): Promise<{data: Model.Category[]; hasMore: boolean; serverTime: string}> {
    const user_id = await this.extractUserIdFromToken();

    const whereFilter: any = {
      user_id: user_id,
    };

    if (last_time_sync && last_time_sync !== '') {
      whereFilter.updated_at = {gte: new Date(last_time_sync)};
    }

    const data = await this.categoryRepository.find({
      where: whereFilter,
      limit: limit_count,
      skip: page * limit_count,
      order: ['updated_at asc'],
    });

    const hasMore = data.length === limit_count;

    const serverTime = new Date().toISOString();

    return {
      data: data,
      hasMore: hasMore,
      serverTime: serverTime,
    };
  }

  //* -------------------------------------------- END GET ---------------------------------------------

  //Todo: ----------------------------------------- POST -----------------------------------------------
  @rest.post('post/sync/batch-category')
  @authenticate('jwt')
  async syncAll(
    @CustomRequestBody.getCustomRequestBody(null, {
      title: 'Sync Batch data Cate',
      extraProps: {
        categories: {
          type: 'array',
          items: rest.getModelSchemaRef(Model.Category, {
            exclude: ['user_id'],
            partial: true,
          }),
        },
      },
    })
    data: {
      categories: Model.Category[];
    },
  ): Promise<{status: string}> {
    const user_id = await this.extractUserIdFromToken();
    await this.syncUserDataUseCase.execute(data.categories, user_id);
    return {status: 'Sync successful'};
  }

  @rest.post('post/sync/batch-transaction')
  @authenticate('jwt')
  async syncAllTransaction(
    @CustomRequestBody.MultipartFormDataRequest({
      description: 'Upload Multiple Transactions with Images',
      additionalProps: true,
    })
    unusedPayload: any,
  ): Promise<any> {
    const user_id = await this.extractUserIdFromToken();

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

  //Todo: -------------------------------------------- END POST --------------------------------------------
}
