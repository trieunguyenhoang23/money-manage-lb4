import {inject, Getter} from '@loopback/core';
import {DefaultCrudRepository, repository, HasManyRepositoryFactory} from '@loopback/repository';
import {MoneyManageDbDataSource} from '../datasources';
import {Reminder, ReminderRelations, Transaction} from '../models';
import {TransactionRepository} from './transaction.repository';

export class ReminderRepository extends DefaultCrudRepository<
  Reminder,
  typeof Reminder.prototype.id,
  ReminderRelations
> {

  public readonly transactions: HasManyRepositoryFactory<Transaction, typeof Reminder.prototype.id>;

  constructor(
    @inject('datasources.MoneyManageDb') dataSource: MoneyManageDbDataSource, @repository.getter('TransactionRepository') protected transactionRepositoryGetter: Getter<TransactionRepository>,
  ) {
    super(Reminder, dataSource);
    this.transactions = this.createHasManyRepositoryFactoryFor('transactions', transactionRepositoryGetter,);
    this.registerInclusionResolver('transactions', this.transactions.inclusionResolver);
  }
}
