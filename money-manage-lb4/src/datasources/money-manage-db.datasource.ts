import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {juggler} from '@loopback/repository';

const config = {
  name: 'MoneyManageDb',
  database: 'MoneyManage',
  connector: 'mongodb',
  url: process.env.MONGO_URL,
  useNewUrlParser: true,
};

@lifeCycleObserver('datasource')
export class MoneyManageDbDataSource
  extends juggler.DataSource
  implements LifeCycleObserver
{
  static dataSourceName = 'MoneyManageDb';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.MoneyManageDb', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
