import {BindingKey} from '@loopback/core';
import {VerifyAuthenticateUseCase} from '../../domain/usecase/user_auth/verify-authenticate.usecase';
import {CreateTransactionUseCase} from './transaction/create_transaction.usecase';
import {SyncCategoryDataUseCase} from './sync/sync-category-data.usecase';
import {UpdateTransactionUseCase} from './transaction/update_transaction.usecase';
import {SyncTransactionDataUseCase} from './sync/sync-transaction-data.usecase';
import {GetFinancialDataUseCase} from './analytics/get_financial_data.usecase';

// USER AUTH
export const VERIFY_AUTH_USECASE = BindingKey.create<VerifyAuthenticateUseCase>(
  'usecases.VerifyAuthenticateUseCase',
);

// SYNC
export const SYNC_CATEGORY_DATA_USECASE =
  BindingKey.create<SyncCategoryDataUseCase>(
    'usecases.SyncCategoryDataUseCase',
  );

export const SYNC_TRANSACTION_DATA_USECASE =
  BindingKey.create<SyncTransactionDataUseCase>(
    'usecases.SyncTransactionDataUseCase',
  );

// TRANSACTION
export const CREATE_TRANSACTION_USECASE =
  BindingKey.create<CreateTransactionUseCase>(
    'usecases.CreateTransactionUseCase',
  );

export const UPDATE_TRANSACTION_USECASE =
  BindingKey.create<UpdateTransactionUseCase>(
    'usecases.UpdateTransactionUseCase',
  );

// ANALYTIC
export const GET_FINANCIAL_DATA_USECASE =
  BindingKey.create<GetFinancialDataUseCase>(
    'usecases.GetFinancialDataUseCase',
  );

export const SPENDING_CATEGORIES_USECASE =
  BindingKey.create<GetFinancialDataUseCase>(
    'usecases.SpendingCategoriesUseCase',
  );
