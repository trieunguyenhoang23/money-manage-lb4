import {inject} from '@loopback/core';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';
import {Getter} from '@loopback/repository';

export class BaseController {
  @inject.getter(SecurityBindings.USER)
  protected getUser: Getter<UserProfile>;

  async extractUserIdFromToken(): Promise<string> {
    const user = await this.getUser();
    return user[securityId];
  }
}
