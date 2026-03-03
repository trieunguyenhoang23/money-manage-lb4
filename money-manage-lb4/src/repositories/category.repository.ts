import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MoneyManageDbDataSource} from '../datasources';
import {Category, CategoryRelations, Reminder, Transaction} from '../models';
import {ReminderRepository} from './reminder.repository';
import {TransactionRepository} from './transaction.repository';

export class CategoryRepository extends DefaultCrudRepository<
  Category,
  typeof Category.prototype.id,
  CategoryRelations
> {

  public readonly reminders: HasManyRepositoryFactory<Reminder, typeof Category.prototype.id>;

  public readonly transactions: HasManyRepositoryFactory<Transaction, typeof Category.prototype.id>;

  constructor(
    @inject('datasources.MoneyManageDb') dataSource: MoneyManageDbDataSource, @repository.getter('ReminderRepository') protected reminderRepositoryGetter: Getter<ReminderRepository>, @repository.getter('TransactionRepository') protected transactionRepositoryGetter: Getter<TransactionRepository>,
  ) {
    super(Category, dataSource);
    this.transactions = this.createHasManyRepositoryFactoryFor('transactions', transactionRepositoryGetter,);
    this.registerInclusionResolver('transactions', this.transactions.inclusionResolver);
    this.reminders = this.createHasManyRepositoryFactoryFor('reminders', reminderRepositoryGetter,);
    this.registerInclusionResolver('reminders', this.reminders.inclusionResolver);
  }
}
