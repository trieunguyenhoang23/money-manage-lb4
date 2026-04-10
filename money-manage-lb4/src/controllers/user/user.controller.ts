import * as repo from '@loopback/repository';
import * as rest from '@loopback/rest';
import * as Model from '../../models';
import * as Repository from '../../repositories';
import * as CustomResponseSchema from '../../utils/custom-response-schema';
import * as CustomRequestBody from '../../utils/custom-request-body';
import {authenticate} from '@loopback/authentication';
import {BaseController} from '../base.controller';

export class UserController extends BaseController {
  constructor(
    @repo.repository(Repository.UserRepository)
    public userRepository: Repository.UserRepository,
  ) {
    super();
  }

  //* ----------------------------------------------- GET ---------------------------------------------------
  @rest.get('get/users/count')
  @rest.response(
    200,
    CustomResponseSchema.getCustomCountResponseSchema('User model count'),
  )
  async count(
    @rest.param.where(Model.User) where?: repo.Where<Model.User>,
  ): Promise<repo.Count> {
    return this.userRepository.count(where);
  }

  @rest.get('get/users/currency')
  @authenticate('jwt')
  @rest.response(
    200,
    CustomResponseSchema.getCustomModelResponseSchema(
      Model.User,
      'Array of User model instances',
      true,
    ),
  )
  async find(): Promise<{currency: string}> {
    const user_id = await this.extractUserIdFromToken();
    const user = await this.userRepository.findById(user_id);

    return {
      currency: user.currency,
    };
  }

  //* ------------------------------------------------- END GET -----------------------------------------------

  //? ------------------------------------------------- PATCH -------------------------------------------------
  @rest.patch('patch/users')
  @authenticate('jwt')
  @rest.response(200, {
    description: 'User PATCH success count',
    content: {'application/json': {schema: repo.CountSchema}},
  })
  async updateAll(
    @CustomRequestBody.getCustomRequestBody(Model.User, {partial: true})
    user: Model.User,
  ): Promise<any> {
    const user_id = await this.extractUserIdFromToken();
    await this.userRepository.updateById(user_id, user);
    return {message: 'Update successful'};
  }
  //? ------------------------------------------------- END PATCH -------------------------------------------------
}
