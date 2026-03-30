import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import {Getter} from '@loopback/core';
import {Category} from '../../models';
import {CategoryRepository} from '../../repositories';
import {
  getCustomCountResponseSchema,
  getCustomModelResponseSchema,
} from '../utils/custom-response-schema';
import {getCustomRequestBody} from '../utils/custom-request-body';
import {inject} from '@loopback/core';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {authenticate} from '@loopback/authentication';
import {TransactionType} from '../../domain/enums/transaction-type.enum';

export class CategoryController {
  constructor(
    @repo.repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
  ) {}

  //* GET
  @rest.get('get/categories/count')
  @rest.response(200, getCustomCountResponseSchema('Category model count'))
  async count(
    @rest.param.where(Category) where?: repo.Where<Category>,
  ): Promise<repo.Count> {
    return this.categoryRepository.count(where);
  }

  @rest.get('get/categories/load_by_page')
  @authenticate('jwt')
  @rest.response(
    200,
    getCustomModelResponseSchema(
      Category,
      'Array of Category model instances',
      true,
      true,
    ),
  )
  async find(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @rest.param.query.number('page') page: number,
    @rest.param.query.number('limit_count') limit_count: number,
    @rest.param.query.string('type') type?: TransactionType,
  ): Promise<Category[]> {
    const currentUserProfile = await getUser();

    // Extract the ID
    const user_id = currentUserProfile[securityId];

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

  @rest.get('get/categories/{id}')
  @rest.response(
    200,
    getCustomModelResponseSchema(
      Category,
      'Category model instance',
      false,
      true,
    ),
  )
  async findById(
    @rest.param.path.string('id') id: string,
    @rest.param.filter(Category, {exclude: 'where'})
    filter?: repo.FilterExcludingWhere<Category>,
  ): Promise<Category> {
    return this.categoryRepository.findById(id, filter);
  }

  //Todo POST
  @rest.post('post/categories')
  @authenticate('jwt')
  @rest.response(
    200,
    getCustomModelResponseSchema(Category, 'Category model instance', false),
  )
  async create(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @getCustomRequestBody(Category, {
      title: 'NewCategory',
    })
    category: Category,
  ): Promise<Category> {
    const currentUserProfile = await getUser();
    // Extract the ID
    const user_id = currentUserProfile[securityId];

    category.user_id = user_id;
    return this.categoryRepository.create(category);
  }

  //? PATCH
  @rest.patch('patch/categories')
  @rest.response(
    200,
    getCustomCountResponseSchema('Category PATCH success count'),
  )
  async updateAll(
    @getCustomRequestBody(Category, {partial: true})
    category: Category,
    @rest.param.where(Category) where?: repo.Where<Category>,
  ): Promise<repo.Count> {
    return this.categoryRepository.updateAll(category, where);
  }

  @rest.patch('patch/categories/{id}')
  @authenticate('jwt')
  @rest.response(204, getCustomCountResponseSchema('Category PATCH success'))
  async updateById(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @rest.param.path.string('id') id: string,
    @getCustomRequestBody(Category, {partial: true})
    category: Category,
  ): Promise<void> {
    const currentUserProfile = await getUser();
    // Extract the ID
    const user_id = currentUserProfile[securityId];

    await this.categoryRepository.updateById(id, category);
  }

  //Todo PUT
  @rest.put('patch/categories/{id}')
  @rest.response(204, getCustomCountResponseSchema('Category PUT success'))
  async replaceById(
    @rest.param.path.string('id') id: string,
    @rest.requestBody() category: Category,
  ): Promise<void> {
    await this.categoryRepository.replaceById(id, category);
  }

  //! DELETE
  @rest.del('delete/categories/{id}')
  @rest.response(204, getCustomCountResponseSchema('Category DELETE success'))
  async deleteById(@rest.param.path.string('id') id: string): Promise<void> {
    await this.categoryRepository.deleteById(id);
  }
}
