import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import * as core from '@loopback/core';

import {User, AuthProvider} from '../../models';
import {UserRepository, AuthProviderRepository} from '../../repositories';
import {
  getCustomModelResponseSchema,
  getCustomCountResponseSchema,
} from '../utils/custom-response-schema';
import {getCustomRequestBody} from '../utils/custom-request-body';
import {VerifyAuthenticateUseCase} from '../../domain/usecase/user_auth/verify-authenticate.usecase';
import {VERIFY_AUTH_USECASE} from '../../domain/usecase/binding_key.usecase';

import {
  RefreshTokenService,
  RefreshTokenServiceBindings,
  TokenObject,
} from '@loopback/authentication-jwt';

export class UserAuthProviderController {
  constructor(
    @repo.repository(UserRepository) protected userRepository: UserRepository,
    @repo.repository(AuthProviderRepository)
    protected authProviderRepository: AuthProviderRepository,

    //UseCase
    @core.inject(VERIFY_AUTH_USECASE)
    private verifyAuthenticateUseCase: VerifyAuthenticateUseCase,

    ///JWT
    @core.inject(RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE)
    public refreshService: RefreshTokenService,
  ) {}

  //* GET
  @rest.get('get/users/{id}/auth-providers')
  @rest.response(
    200,
    getCustomModelResponseSchema(
      AuthProvider,
      'Array of User has many AuthProvider',
      true,
    ),
  )
  async find(
    @rest.param.path.string('id') id: string,
    @rest.param.query.object('filter') filter?: repo.Filter<AuthProvider>,
  ): Promise<AuthProvider[]> {
    return this.userRepository.authProviders(id).find(filter);
  }

  //Todo: POST
  @rest.post('post/user-auth/verify_authenticate')
  @rest.response(200, getCustomModelResponseSchema(User, '', false))
  async verifyAuthenticate(
    @getCustomRequestBody(AuthProvider, {
      partial: true,
      extraProps: {
        display_name: {type: 'string'},
        avatar_url: {type: 'string'},
      },
    })
    requestBody: any,
  ) {
    return await this.verifyAuthenticateUseCase.execute(requestBody);
  }

  @rest.post('post/user-auth/refresh_token')
  async refresh(
    @getCustomRequestBody(
      {name: 'Auth'},
      {
        title: 'RefreshTokenRequest',
        extraProps: {
          refreshToken: {type: 'string'},
        },
      },
    )
    refreshRequest: {
      refreshToken: string;
    },
  ): Promise<TokenObject> {
    try {
      return await this.refreshService.refreshToken(
        refreshRequest.refreshToken,
      );
    } catch (err) {
      throw new rest.HttpErrors.Unauthorized(
        'Invalid or expired refresh token',
      );
    }
  }

  @rest.post('post/users/{id}/auth-providers')
  @rest.response(
    200,
    getCustomModelResponseSchema(AuthProvider, 'User model instance', false),
  )
  async create(
    @rest.param.path.string('id') id: typeof User.prototype.id,
    @getCustomRequestBody(AuthProvider, {
      title: 'NewAuthProviderInUser',
      exclude: ['id'],
      optional: ['user_id'],
    })
    authProvider: Omit<AuthProvider, 'id'>,
  ): Promise<AuthProvider> {
    return this.userRepository.authProviders(id).create(authProvider);
  }

  //? PATCH
  @rest.patch('/users/{id}/auth-providers')
  @rest.response(
    200,
    getCustomCountResponseSchema('User.AuthProvider PATCH success count'),
  )
  async patch(
    @rest.param.path.string('id') id: string,
    @getCustomRequestBody(User, {
      title: 'Patch User',
      partial: true,
    })
    authProvider: Partial<AuthProvider>,
    @rest.param.query.object('where', rest.getWhereSchemaFor(AuthProvider))
    where?: repo.Where<AuthProvider>,
  ): Promise<repo.Count> {
    return this.userRepository.authProviders(id).patch(authProvider, where);
  }

  //! DELETE
  @rest.del('delete/users/{id}/auth-providers')
  @rest.response(
    200,
    getCustomCountResponseSchema('User.AuthProvider DELETE success count'),
  )
  async delete(
    @rest.param.path.string('id') id: string,
    @rest.param.query.object('where', rest.getWhereSchemaFor(AuthProvider))
    where?: repo.Where<AuthProvider>,
  ): Promise<repo.Count> {
    return this.userRepository.authProviders(id).delete(where);
  }
}
