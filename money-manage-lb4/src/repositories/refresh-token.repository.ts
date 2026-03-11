import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {MoneyManageDbDataSource} from '../datasources';
import {RefreshToken} from '@loopback/authentication-jwt'; // Use the internal model

export class RefreshTokenRepository extends DefaultCrudRepository<
  RefreshToken,
  typeof RefreshToken.prototype.id
> {
  constructor(
    @inject('datasources.MoneyManageDb') dataSource: MoneyManageDbDataSource,
  ) {
    // The library version 0.16.x expects this specific internal model
    super(RefreshToken, dataSource);
  }
}