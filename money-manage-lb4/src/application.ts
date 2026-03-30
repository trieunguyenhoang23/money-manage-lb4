import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {MySequence} from './sequence';
import {VerifyAuthenticateUseCase} from './domain/usecase/user_auth/verify-authenticate.usecase';
import {
  CREATE_TRANSACTION_USECASE,
  SYNC_CATEGORY_DATA_USECASE,
  SYNC_TRANSACTION_DATA_USECASE,
  UPDATE_TRANSACTION_USECASE,
  VERIFY_AUTH_USECASE,
} from './domain/usecase/binding_key.usecase';
import {AuthenticationComponent} from '@loopback/authentication';
import * as auth from '@loopback/authentication-jwt';
import {MoneyManageDbDataSource} from './datasources';
import {RefreshTokenRepository} from './repositories/refresh-token.repository';
import {SyncCategoryDataUseCase} from './domain/usecase/sync/sync-user-data.usecase';
import {CreateTransactionUseCase} from './domain/usecase/transaction/create_transaction.usecase';
import {UploadFileMulterService} from './infrastructure/file/upload-file_multer.service';
import {UploadFileS3Service} from './infrastructure/file/upload-file-s3.service';
import {
  UPLOAD_FILE_MULTER_SERVICE,
  UPLOAD_FILE_S3_SERVICE,
} from './infrastructure/binding_key.infrastructure';
import {UpdateTransactionUseCase} from './domain/usecase/transaction/update_transaction.usecase';
import { SyncTransactionDataUseCase } from './domain/usecase/sync/sync-transaction-data.usecase';

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
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };

    // USE CASE Binding
    this.bind(VERIFY_AUTH_USECASE.key).toClass(VerifyAuthenticateUseCase);
    this.bind(SYNC_CATEGORY_DATA_USECASE.key).toClass(SyncCategoryDataUseCase);
    this.bind(SYNC_TRANSACTION_DATA_USECASE.key).toClass(SyncTransactionDataUseCase);
    this.bind(CREATE_TRANSACTION_USECASE.key).toClass(CreateTransactionUseCase);
    this.bind(UPDATE_TRANSACTION_USECASE.key).toClass(UpdateTransactionUseCase);

    // INFRASTRUCTURE Binding
    this.bind(UPLOAD_FILE_MULTER_SERVICE.key).toClass(UploadFileMulterService);
    this.bind(UPLOAD_FILE_S3_SERVICE.key).toClass(UploadFileS3Service);

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
