import {inject, Getter} from '@loopback/core';
import {
  DefaultCrudRepository,
  repository,
  BelongsToAccessor,
} from '@loopback/repository';
// 1. Double check this name in your ../datasources/db.datasource.ts file
import {MoneyManageDbDataSource} from '../datasources';
import {Transaction, TransactionRelations, Category} from '../models';
import {CategoryRepository} from './category.repository';

export class TransactionRepository extends DefaultCrudRepository<
  Transaction,
  typeof Transaction.prototype.id,
  TransactionRelations
> {
  public readonly category: BelongsToAccessor<
    Category,
    typeof Transaction.prototype.id
  >;

  constructor(
    @inject('datasources.MoneyManageDb') dataSource: MoneyManageDbDataSource,
    @repository.getter('CategoryRepository')
    protected categoryRepositoryGetter: Getter<CategoryRepository>,
  ) {
    super(Transaction, dataSource);

    this.category = this.createBelongsToAccessorFor(
      'category',
      categoryRepositoryGetter,
    );

    // Register the resolver so 'include' works in the controller
    this.registerInclusionResolver('category', this.category.inclusionResolver);
  }
}
