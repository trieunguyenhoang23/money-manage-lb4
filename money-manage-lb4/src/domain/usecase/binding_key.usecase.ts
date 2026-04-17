import {BindingKey} from '@loopback/core';
import * as UseCase from '././index';

//* USER AUTH
export const VERIFY_AUTH_USE_CASE =
  BindingKey.create<UseCase.VerifyAuthenticateUseCase>(
    'UseCase.VerifyAuthenticateUseCase',
  );

//* SYNC
export const SYNC_CATEGORY_DATA_USE_CASE =
  BindingKey.create<UseCase.SyncCategoryDataUseCase>(
    'UseCase.SyncCategoryDataUseCase',
  );

export const SYNC_TRANSACTION_DATA_USE_CASE =
  BindingKey.create<UseCase.SyncTransactionDataUseCase>(
    'UseCase.SyncTransactionDataUseCase',
  );

//* TRANSACTION
export const CREATE_TRANSACTION_USE_CASE =
  BindingKey.create<UseCase.CreateTransactionUseCase>(
    'UseCase.CreateTransactionUseCase',
  );

export const UPDATE_TRANSACTION_USE_CASE =
  BindingKey.create<UseCase.UpdateTransactionUseCase>(
    'UseCase.UpdateTransactionUseCase',
  );
export const DELETE_TRANSACTION_USE_CASE =
  BindingKey.create<UseCase.DeleteTransactionUseCase>(
    'UseCase.DeleteTransactionUseCase',
  );

//* ANALYTIC
export const GET_FINANCIAL_DATA_USE_CASE =
  BindingKey.create<UseCase.GetFinancialDataUseCase>(
    'UseCase.GetFinancialDataUseCase',
  );

export const SPENDING_CATEGORIES_USE_CASE =
  BindingKey.create<UseCase.SpendingCategoriesUseCase>(
    'UseCase.SpendingCategoriesUseCase',
  );

export const GET_OVERVIEW_USE_CASE =
  BindingKey.create<UseCase.GetOverviewUseCase>(
    'UseCase.GetOverviewUseCase',
  );
