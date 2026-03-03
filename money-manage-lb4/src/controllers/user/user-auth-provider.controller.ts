import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  getWhereSchemaFor,
  param,
  patch,
  post,
  requestBody,
} from '@loopback/rest';
import {
  User,
  AuthProvider,
} from '../../models';
import {UserRepository} from '../../repositories';

export class UserAuthProviderController {
  constructor(
    @repository(UserRepository) protected userRepository: UserRepository,
  ) { }

  @get('/users/{id}/auth-providers', {
    responses: {
      '200': {
        description: 'Array of User has many AuthProvider',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(AuthProvider)},
          },
        },
      },
    },
  })
  async find(
    @param.path.string('id') id: string,
    @param.query.object('filter') filter?: Filter<AuthProvider>,
  ): Promise<AuthProvider[]> {
    return this.userRepository.authProviders(id).find(filter);
  }

  @post('/users/{id}/auth-providers', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: getModelSchemaRef(AuthProvider)}},
      },
    },
  })
  async create(
    @param.path.string('id') id: typeof User.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthProvider, {
            title: 'NewAuthProviderInUser',
            exclude: ['id'],
            optional: ['user_id']
          }),
        },
      },
    }) authProvider: Omit<AuthProvider, 'id'>,
  ): Promise<AuthProvider> {
    return this.userRepository.authProviders(id).create(authProvider);
  }

  @patch('/users/{id}/auth-providers', {
    responses: {
      '200': {
        description: 'User.AuthProvider PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async patch(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(AuthProvider, {partial: true}),
        },
      },
    })
    authProvider: Partial<AuthProvider>,
    @param.query.object('where', getWhereSchemaFor(AuthProvider)) where?: Where<AuthProvider>,
  ): Promise<Count> {
    return this.userRepository.authProviders(id).patch(authProvider, where);
  }

  @del('/users/{id}/auth-providers', {
    responses: {
      '200': {
        description: 'User.AuthProvider DELETE success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async delete(
    @param.path.string('id') id: string,
    @param.query.object('where', getWhereSchemaFor(AuthProvider)) where?: Where<AuthProvider>,
  ): Promise<Count> {
    return this.userRepository.authProviders(id).delete(where);
  }
}
