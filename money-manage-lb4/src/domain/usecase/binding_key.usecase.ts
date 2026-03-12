import {BindingKey} from '@loopback/core';
import {VerifyAuthenticateUseCase} from '../../domain/usecase/user_auth/verify-authenticate.usecase';

export const VERIFY_AUTH_USECASE = BindingKey.create<VerifyAuthenticateUseCase>(
  'usecases.VerifyAuthenticateUseCase',
);

export const SYNC_USER_DATA_USECASE = BindingKey.create<VerifyAuthenticateUseCase>(
  'usecases.SyncUserDataUseCase',
);