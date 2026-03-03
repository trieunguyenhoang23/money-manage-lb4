import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MoneyManageDbDataSource} from '../datasources';
import {User, UserRelations, Category, AuthProvider, Reminder, Transaction} from '../models';
import {CategoryRepository} from './category.repository';
import {AuthProviderRepository} from './auth-provider.repository';
import {ReminderRepository} from './reminder.repository';
import {TransactionRepository} from './transaction.repository';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {

  public readonly categories: HasManyRepositoryFactory<Category, typeof User.prototype.id>;

  public readonly authProviders: HasManyRepositoryFactory<AuthProvider, typeof User.prototype.id>;

  public readonly reminders: HasManyRepositoryFactory<Reminder, typeof User.prototype.id>;

  public readonly transactions: HasManyRepositoryFactory<Transaction, typeof User.prototype.id>;

  constructor(
    @inject('datasources.MoneyManageDb') dataSource: MoneyManageDbDataSource, @repository.getter('CategoryRepository') protected categoryRepositoryGetter: Getter<CategoryRepository>, @repository.getter('AuthProviderRepository') protected authProviderRepositoryGetter: Getter<AuthProviderRepository>, @repository.getter('ReminderRepository') protected reminderRepositoryGetter: Getter<ReminderRepository>, @repository.getter('TransactionRepository') protected transactionRepositoryGetter: Getter<TransactionRepository>,
  ) {
    super(User, dataSource);
    this.transactions = this.createHasManyRepositoryFactoryFor('transactions', transactionRepositoryGetter,);
    this.registerInclusionResolver('transactions', this.transactions.inclusionResolver);
    this.reminders = this.createHasManyRepositoryFactoryFor('reminders', reminderRepositoryGetter,);
    this.registerInclusionResolver('reminders', this.reminders.inclusionResolver);
    this.authProviders = this.createHasManyRepositoryFactoryFor('authProviders', authProviderRepositoryGetter,);
    this.registerInclusionResolver('authProviders', this.authProviders.inclusionResolver);
    this.categories = this.createHasManyRepositoryFactoryFor('categories', categoryRepositoryGetter,);
    this.registerInclusionResolver('categories', this.categories.inclusionResolver);
  }
}
