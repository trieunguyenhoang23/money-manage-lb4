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
  SYNC_USER_DATA_USECASE,
  VERIFY_AUTH_USECASE,
} from './domain/usecase/binding_key.usecase';
import {AuthenticationComponent} from '@loopback/authentication';
import * as auth from '@loopback/authentication-jwt';
import {MoneyManageDbDataSource} from './datasources';
import {RefreshTokenRepository} from './repositories/refresh-token.repository';
import {SyncUserDataUseCase} from './domain/usecase/sync/sync-user-data.usecase';

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

    ///USE CASE Binding
    this.bind(VERIFY_AUTH_USECASE.key).toClass(VerifyAuthenticateUseCase);
    this.bind(SYNC_USER_DATA_USECASE.key).toClass(SyncUserDataUseCase);

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
