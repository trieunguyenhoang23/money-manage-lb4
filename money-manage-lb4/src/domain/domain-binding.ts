import {Application} from '@loopback/core';
import * as UseCase from './usecase/index';
import * as UseCaseKey from './usecase/binding_key.usecase';

export function registerDomainBinding(app: Application): void {
  //* USER AUTH
  app
    .bind(UseCaseKey.VERIFY_AUTH_USE_CASE.key)
    .toClass(UseCase.VerifyAuthenticateUseCase);

  //* SYNC
  app
    .bind(UseCaseKey.SYNC_CATEGORY_DATA_USE_CASE.key)
    .toClass(UseCase.SyncCategoryDataUseCase);
  app
    .bind(UseCaseKey.SYNC_TRANSACTION_DATA_USE_CASE.key)
    .toClass(UseCase.SyncTransactionDataUseCase);

  //* TRANSACTION
  app
    .bind(UseCaseKey.CREATE_TRANSACTION_USE_CASE.key)
    .toClass(UseCase.CreateTransactionUseCase);
  app
    .bind(UseCaseKey.UPDATE_TRANSACTION_USE_CASE.key)
    .toClass(UseCase.UpdateTransactionUseCase);
  app
    .bind(UseCaseKey.DELETE_TRANSACTION_USE_CASE.key)
    .toClass(UseCase.DeleteTransactionUseCase);

  //* ANALYTIC
  app
    .bind(UseCaseKey.GET_FINANCIAL_DATA_USE_CASE.key)
    .toClass(UseCase.GetFinancialDataUseCase);
  app
    .bind(UseCaseKey.SPENDING_CATEGORIES_USE_CASE.key)
    .toClass(UseCase.SpendingCategoriesUseCase);
  app
    .bind(UseCaseKey.GET_OVERVIEW_USE_CASE.key)
    .toClass(UseCase.GetOverviewUseCase);
}
