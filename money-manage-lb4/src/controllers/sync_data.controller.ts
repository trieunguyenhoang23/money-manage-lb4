import {inject} from '@loopback/core';
import {Getter} from '@loopback/core';
import {repository} from '@loopback/repository';
import {post, getModelSchemaRef} from '@loopback/rest';
import {CategoryRepository, TransactionRepository} from '../repositories';
import {Category, Reminder, Transaction} from '../models';
import {getCustomRequestBody} from './utils/custom-request-body';
import {SYNC_USER_DATA_USECASE} from '../domain/usecase/binding_key.usecase';
import {SyncUserDataUseCase} from '../domain/usecase/sync/sync-user-data.usecase';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';
import {authenticate} from '@loopback/authentication';

export class SyncDataController {
  constructor(
    @repository(CategoryRepository)
    public categoryRepository: CategoryRepository,
    @repository(TransactionRepository)
    public transactionRepository: TransactionRepository,
    @inject(SYNC_USER_DATA_USECASE)
    private syncUserDataUseCase: SyncUserDataUseCase,
  ) {}

  @post('post/sync/user-data')
  @authenticate('jwt')
  async syncAll(
    @inject.getter(SecurityBindings.USER) getUser: Getter<UserProfile>,
    @getCustomRequestBody(null, {
      title: 'Sync data Cate - Transaction',
      extraProps: {
        categories: {
          type: 'array',
          items: getModelSchemaRef(Category, {exclude: ['user_id']}),
        },
        transactions: {
          type: 'array',
          items: getModelSchemaRef(Transaction, {exclude: ['user_id']}),
        },
        reminders: {
          type: 'array',
          items: getModelSchemaRef(Reminder, {exclude: ['user_id']}),
        },
      },
    })
    data: {
      categories: Category[];
      transactions: Transaction[];
      reminders: Reminder[];
    },
  ): Promise<{status: string}> {
    const currentUserProfile = await getUser();

    // Extract the ID
    const user_id = currentUserProfile[securityId];
    return await this.syncUserDataUseCase.execute(data, user_id);
  }
}
