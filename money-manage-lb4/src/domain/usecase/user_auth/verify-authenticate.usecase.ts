import * as core from '@loopback/core';
import * as repo from '@loopback/repository';
import * as Authenticate from '@loopback/authentication-jwt';
import * as Repository from '../../../repositories';
import {securityId, UserProfile} from '@loopback/security';
import {TokenService} from '@loopback/authentication';
import {VERIFY_AUTH_USE_CASE} from '../binding_key.usecase';
import {User} from '../../../models';

@core.bind({
  scope: core.BindingScope.SINGLETON,
  tags: {key: VERIFY_AUTH_USE_CASE.key},
})
export class VerifyAuthenticateUseCase {
  constructor(
    @repo.repository(Repository.UserRepository)
    protected userRepository: Repository.UserRepository,
    @repo.repository(Repository.AuthProviderRepository)
    protected authProviderRepository: Repository.AuthProviderRepository,
    @core.inject(Authenticate.TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @core.inject(Authenticate.RefreshTokenServiceBindings.REFRESH_TOKEN_SERVICE)
    public refreshTokenService: Authenticate.RefreshTokenService,
  ) {}

  async execute(
    requestBody: any,
  ): Promise<{token: string; refreshToken: string; user: User}> {
    const {
      provider_user_id,
      provider_email,
      provider_type,
      avatar_url,
      display_name,
      currency,
    } = requestBody;

    // 1. Resolve the User
    const user = await this.resolveUser({
      provider_user_id,
      provider_email,
      provider_type,
      avatar_url,
      display_name,
      currency,
    });

    // 2. Prepare the User Profile for JWT
    const userProfile: UserProfile = {
      [securityId]: user.id!.toString(),
      name: user.display_name,
      id: user.id!,
    };

    // 3. Generate Access Token
    const token = await this.jwtService.generateToken(userProfile);

    // 4. Generate Refresh Token
    const refreshTokenResponse = await this.refreshTokenService.generateToken(
      userProfile,
      token,
    );

    return {
      token,
      refreshToken: refreshTokenResponse.refreshToken!,
      user,
    };
  }

  private async resolveUser(data: any): Promise<User> {
    const now = new Date().toISOString();

    const authLink = await this.authProviderRepository.findOne({
      where: {
        provider_user_id: data.provider_user_id,
        provider_type: data.provider_type,
      },
    });

    if (authLink) {
      return this.userRepository.findById(authLink.user_id);
    }

    let user = await this.userRepository.findOne({
      where: {primary_email: data.provider_email},
    });

    if (!user) {
      user = await this.userRepository.create({
        display_name: data.display_name,
        avatar_url: data.avatar_url,
        primary_email: data.provider_email,
        created_at: now,
        currency: data.currency,
      });
    }

    //Ensure user.id is treated as a string for the AuthProvider creation
    await this.authProviderRepository.create({
      provider_user_id: data.provider_user_id,
      provider_email: data.provider_email,
      provider_type: data.provider_type,
      user_id: user.id!,
      created_at: now,
    });

    return user;
  }
}
