import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, BindingScope} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {AuthenticationComponent} from '@loopback/authentication';
import * as auth from '@loopback/authentication-jwt';
import {MoneyManageDbDataSource} from './datasources';
import {RefreshTokenRepository} from './repositories/refresh-token.repository';
import {SyncCategoryDataUseCase} from './domain/usecase/sync/sync-category-data.usecase';
import {CreateTransactionUseCase} from './domain/usecase/transaction/create_transaction.usecase';
import {UploadFileMulterService} from './infrastructure/file/upload-file_multer.service';
import {UploadFileS3Service} from './infrastructure/file/upload-file-s3.service';
import * as infrastructure from './infrastructure/binding_key.infrastructure';
import {VerifyAuthenticateUseCase} from './domain/usecase/user_auth/verify-authenticate.usecase';
import * as UseCaseKey from './domain/usecase/binding_key.usecase';
import {UpdateTransactionUseCase} from './domain/usecase/transaction/update_transaction.usecase';
import {SyncTransactionDataUseCase} from './domain/usecase/sync/sync-transaction-data.usecase';
import {SocketService} from './infrastructure/socket/socket.service';
import * as UseCase from './domain/usecase/index';
import {SyncNotifyService} from './infrastructure/socket/sync_notifier.service';
import {SocketObserver} from './infrastructure/socket/socket.observer';

export {ApplicationConfig};

export class MoneyMangeApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    this.bootOptions = {
      controllers: {
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // USE CASE Binding
    this.bind(UseCaseKey.VERIFY_AUTH_USECASE.key).toClass(
      VerifyAuthenticateUseCase,
    );
    this.bind(UseCaseKey.SYNC_CATEGORY_DATA_USECASE.key).toClass(
      SyncCategoryDataUseCase,
    );
    this.bind(UseCaseKey.SYNC_TRANSACTION_DATA_USECASE.key).toClass(
      SyncTransactionDataUseCase,
    );
    this.bind(UseCaseKey.CREATE_TRANSACTION_USECASE.key).toClass(
      CreateTransactionUseCase,
    );
    this.bind(UseCaseKey.UPDATE_TRANSACTION_USECASE.key).toClass(
      UpdateTransactionUseCase,
    );
    this.bind(UseCaseKey.GET_FINANCIAL_DATA_USECASE.key).toClass(
      UseCase.GetFinancialDataUseCase,
    );
    this.bind(UseCaseKey.SPENDING_CATEGORIES_USECASE.key).toClass(
      UseCase.SpendingCategoriesUseCase,
    );
    this.bind(UseCaseKey.GET_OVERVIEW_USECASE.key).toClass(
      UseCase.GetOverviewUseCase,
    );

    // INFRASTRUCTURE Binding
    this.bind(infrastructure.UPLOAD_FILE_MULTER_SERVICE.key).toClass(
      UploadFileMulterService,
    );
    this.bind(infrastructure.UPLOAD_FILE_S3_SERVICE.key).toClass(
      UploadFileS3Service,
    );
    this.lifeCycleObserver(SocketObserver);
    this.bind(infrastructure.SOCKET_SERVICE.key)
      .toClass(SocketService)
      .inScope(BindingScope.SINGLETON);
    this.bind(infrastructure.SYNC_NOTIFIER_SERVICE.key)
      .toClass(SyncNotifyService)
      .inScope(BindingScope.SINGLETON);

    /// JWT Config
    this.component(AuthenticationComponent);
    this.component(auth.JWTAuthenticationComponent);

    // Bind the Refresh Token Repository to your DataSource
    this.bind(auth.RefreshTokenServiceBindings.REFRESH_REPOSITORY).toClass(
      RefreshTokenRepository,
    );

    // Bind Secret
    this.bind(auth.TokenServiceBindings.TOKEN_SECRET).to(
      process.env.JWT_SECRET ?? 'fallback-secret-if-env-fails',
    );

    // Access Token Expiration (e.g., 1 hour)
    this.bind(auth.TokenServiceBindings.TOKEN_EXPIRES_IN).to(
      process.env.JWT_EXPIRES_IN ?? '3600',
    );

    this.bind(auth.RefreshTokenServiceBindings.REFRESH_EXPIRES_IN).to(
      process.env.REFRESH_EXPIRES_IN ?? '2592000',
    );

    // This allows the JWT system to query User collection
    this.dataSource(
      MoneyManageDbDataSource,
      auth.UserServiceBindings.DATASOURCE_NAME,
    );
  }
}
