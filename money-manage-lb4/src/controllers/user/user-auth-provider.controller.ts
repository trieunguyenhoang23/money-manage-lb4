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

export class UserAuthProviderController {
  constructor(
    //* Repository
    @repo.repository(Repository.UserRepository)
    protected userRepository: Repository.UserRepository,
    @repo.repository(Repository.AuthProviderRepository)
    protected authProviderRepository: Repository.AuthProviderRepository,

    //* Use Case
    @core.inject(UseCaseKey.VERIFY_AUTH_USE_CASE)
    private verifyAuthenticateUseCase: UseCase.VerifyAuthenticateUseCase,

    //* JWT
    @core.inject(Authenticate.RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE)
    public refreshService: Authenticate.RefreshTokenService,
  ) {}

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

  //Todo: -------------------------------------------- END POST --------------------------------------------
}
