import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import * as core from '@loopback/core';
import * as Model from '../../models';
import * as Repository from '../../repositories';
import * as CustomResponseSchema from '../../utils/custom-response-schema';
import * as CustomRequestBody from '../../utils/custom-request-body';
import * as InfrastructureKey from '../../infrastructure/binding_key.infrastructure';
import * as Infrastructure from '../../infrastructure/index';
import {authenticate} from '@loopback/authentication';
import {TransactionType} from '../../domain/enums/transaction-type.enum';
import {BaseController} from '../base.controller';

export class CategoryController extends BaseController {
  constructor(
    //* Repository
    @repo.repository(Repository.CategoryRepository)
    public categoryRepository: Repository.CategoryRepository,
    @core.inject(InfrastructureKey.SYNC_NOTIFIER_SERVICE)
    private syncNotifyService: Infrastructure.SyncNotifyService,
  ) {
    super();
  }

  //* -------------------------------------------- GET --------------------------------------------
  @rest.get('get/categories/count')
  @rest.response(
    200,
    CustomResponseSchema.getCustomCountResponseSchema('Category model count'),
  )
  async count(
    @rest.param.where(Model.Category) where?: repo.Where<Model.Category>,
  ): Promise<repo.Count> {
    return this.categoryRepository.count(where);
  }

  @rest.get('get/categories/load_by_page')
  @authenticate('jwt')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(
      Model.Category,
      'Array of Category model instances',
      true,
      true,
    ),
  )
  async find(
    @rest.param.query.number('page') page: number,
    @rest.param.query.number('limit_count') limit_count: number,
    @rest.param.query.string('type') type?: TransactionType,
  ): Promise<Model.Category[]> {
    const user_id = await this.extractUserIdFromToken();

    const filter: any = {user_id};

    if (type !== undefined) {
      filter.type = type;
    }

    return this.categoryRepository.find({
      limit: limit_count,
      skip: page * limit_count,
      order: ['created_at desc'],
      where: filter,
    });
  }

  //* -------------------------------------------- END GET ---------------------------------------------

  //Todo: ----------------------------------------- POST -----------------------------------------------
  @rest.post('post/categories')
  @authenticate('jwt')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(
      Model.Category,
      'Category model instance',
      false,
    ),
  )
  async create(
    @CustomRequestBody.getCustomRequestBody(Model.Category, {
      title: 'NewCategory',
    })
    category: Model.Category,
  ): Promise<any> {
    const user_id = await this.extractUserIdFromToken();

    category.user_id = user_id;
    await this.categoryRepository.create(category);
    this.syncNotifyService.notifySyncCompleted(user_id, 'category');
    return {message: 'Success'};
  }
  //Todo: -------------------------------------------- END POST --------------------------------------------

  //? ------------------------------------------------- PATCH -------------------------------------------------
  @rest.patch('patch/categories/{id}')
  @authenticate('jwt')
  @rest.response(
    204,
    CustomResponseSchema.getCustomCountResponseSchema('Category PATCH success'),
  )
  async updateById(
    @rest.param.path.string('id') id: string,
    @CustomRequestBody.getCustomRequestBody(Model.Category, {partial: true})
    category: Model.Category,
  ): Promise<void> {
    const user_id = await this.extractUserIdFromToken();

    await this.categoryRepository.updateById(id, category);
    this.syncNotifyService.notifySyncCompleted(user_id, 'category');
  }

  //? ------------------------------------------------- END PATCH -------------------------------------------------
}
