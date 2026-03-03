import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import {User} from '../../models';
import {UserRepository} from '../../repositories';
import {
  getCustomModelResponseSchema,
  getCustomCountResponseSchema,
} from '../utils/custom-response-schema';
import {getCustomRequestBody} from '../utils/custom-request-body';

export class UserController {
  constructor(
    @repo.repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  //* GET
  @rest.get('get/users/count')
  @rest.response(200, getCustomCountResponseSchema('User model count'))
  async count(
    @rest.param.where(User) where?: repo.Where<User>,
  ): Promise<repo.Count> {
    return this.userRepository.count(where);
  }

  @rest.get('get/users')
  @rest.response(
    200,
    getCustomModelResponseSchema(User, 'Array of User model instances', true),
  )
  async find(
    @rest.param.filter(User) filter?: repo.Filter<User>,
  ): Promise<User[]> {
    return this.userRepository.find(filter);
  }

  @rest.get('get/users/{id}')
  @rest.response(
    200,
    getCustomModelResponseSchema(User, 'User model instance', true, true),
  )
  async findById(
    @rest.param.path.string('id') id: string,
    @rest.param.filter(User, {exclude: 'where'})
    filter?: repo.FilterExcludingWhere<User>,
  ): Promise<User> {
    return this.userRepository.findById(id, filter);
  }

  //Todo POST
  @rest.post('post/users')
  @rest.response(200, getCustomModelResponseSchema(User, 'User model instance'))
  async create(
    @getCustomRequestBody(User, {
      title: 'NewUser',
      exclude: ['id'],
    })
    user: Omit<User, 'id'>,
  ): Promise<User> {
    return this.userRepository.create(user);
  }

  //? PATCH
  @rest.patch('patch/users')
  @rest.response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: repo.CountSchema}},
  })
  async updateAll(
    @rest.requestBody({
      content: {
        'application/json': {
          schema: rest.getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
    @rest.param.where(User) where?: repo.Where<User>,
  ): Promise<repo.Count> {
    return this.userRepository.updateAll(user, where);
  }

  @rest.patch('patch/users/{id}')
  @rest.response(204, {
    description: 'User PATCH success',
  })
  async updateById(
    @rest.param.path.string('id') id: string,
    @rest.requestBody({
      content: {
        'application/json': {
          schema: rest.getModelSchemaRef(User, {partial: true}),
        },
      },
    })
    user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  //Todo PUT
  @rest.put('/users/{id}')
  @rest.response(204, {
    description: 'User PUT success',
  })
  async replaceById(
    @rest.param.path.string('id') id: string,
    @rest.requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  //! Delete
  @rest.del('/users/{id}')
  @rest.response(204, {
    description: 'User DELETE success',
  })
  async deleteById(@rest.param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}
