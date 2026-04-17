import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import * as core from '@loopback/core';
import * as Model from '../../models';
import * as Repository from '../../repositories';
import * as CustomResponseSchema from '../../utils/custom-response-schema';
import * as CustomRequestBody from '../../utils/custom-request-body';
import * as UseCaseKey from '../../domain/usecase/binding_key.usecase';
import * as UseCase from '../../domain/usecase/index';
import * as Authenticate from '@loopback/authentication-jwt';
import * as Infrastructure from '../../infrastructure/index';
import * as InfrastructureKey from '../../infrastructure/binding_key.infrastructure';
import {authenticate} from '@loopback/authentication';
import {BaseController} from '../base.controller';

export class UserAuthProviderController extends BaseController {
  constructor(
    //* Repository
    @repo.repository(Repository.UserRepository)
    protected userRepository: Repository.UserRepository,
    @repo.repository(Repository.AuthProviderRepository)
    protected authProviderRepository: Repository.AuthProviderRepository,
    @repo.repository(Authenticate.RefreshTokenRepository)
    protected refreshTokenRepository: Authenticate.RefreshTokenRepository,
    //* Use Case
    @core.inject(UseCaseKey.VERIFY_AUTH_USE_CASE)
    private verifyAuthenticateUseCase: UseCase.VerifyAuthenticateUseCase,

    //* JWT
    @core.inject(Authenticate.RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE)
    public refreshService: Authenticate.RefreshTokenService,

    //* Infrastructure
    @core.inject(InfrastructureKey.SOCKET_SERVICE)
    public socketService: Infrastructure.SocketService,
  ) {
    super();
  }

  //Todo: ----------------------------------------- POST -----------------------------------------------
  @rest.post('post/user-auth/verify_authenticate')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(Model.User, '', false),
  )
  async verifyAuthenticate(
    @CustomRequestBody.getCustomRequestBody(Model.AuthProvider, {
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
    @CustomRequestBody.getCustomRequestBody(
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
  ): Promise<Authenticate.TokenObject> {
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

  @authenticate('jwt')
  @rest.post('post/user-auth/logout')
  async logout(
    @rest.param.header.string('x-refresh-token') refreshToken?: string,
  ): Promise<object> {
    const user_id = await this.extractUserIdFromToken();
    try {
      if (refreshToken) {
        await this.refreshTokenRepository.deleteAll({
          refreshToken: refreshToken,
          userId: user_id,
        });
        if (this.socketService && this.socketService.io) {
          this.socketService.io.in(user_id).disconnectSockets(true);
          console.log(`🔌 Disconnected all sockets for user: ${user_id}`);
        }
      }

      return {success: true, message: 'Logout successful'};
    } catch (err) {
      throw new rest.HttpErrors.InternalServerError('Error during logout');
    }
  }

  //Todo: -------------------------------------------- END POST --------------------------------------------
}
