import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MoneyManageDbDataSource} from '../datasources';
import {AuthProvider, AuthProviderRelations} from '../models';

export class AuthProviderRepository extends DefaultCrudRepository<
  AuthProvider,
  typeof AuthProvider.prototype.id,
  AuthProviderRelations
> {
  constructor(
    @inject('datasources.MoneyManageDb') dataSource: MoneyManageDbDataSource,
  ) {
    super(AuthProvider, dataSource);
  }
}
