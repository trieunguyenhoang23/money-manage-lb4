import {BindingScope} from '@loopback/core';
import * as InfrastructureKey from './binding_key.infrastructure';
import * as Service from './index';
import * as auth from '@loopback/authentication-jwt';
import {AuthenticationComponent} from '@loopback/authentication';
import {MoneyManageDbDataSource} from '../datasources';
import {RefreshTokenRepository} from '../repositories/refresh-token.repository';
import {MoneyMangeApplication} from '../application';

export function registerInfrastructure(app: MoneyMangeApplication) {
  //* FILE
  app
    .bind(InfrastructureKey.UPLOAD_FILE_MULTER_SERVICE.key)
    .toClass(Service.UploadFileMulterService);
  app
    .bind(InfrastructureKey.UPLOAD_FILE_S3_SERVICE.key)
    .toClass(Service.UploadFileS3Service);
  app.lifeCycleObserver(Service.SocketObserver);

  //* SOCKET
  app
    .bind(InfrastructureKey.SOCKET_SERVICE.key)
    .toClass(Service.SocketService)
    .inScope(BindingScope.SINGLETON);
  app
    .bind(InfrastructureKey.SYNC_NOTIFIER_SERVICE.key)
    .toClass(Service.SyncNotifyService)
    .inScope(BindingScope.TRANSIENT);

  //* JWT
  app.component(AuthenticationComponent);
  app.component(auth.JWTAuthenticationComponent);

  // Bind the Refresh Token Repository to your DataSource
  app
    .bind(auth.RefreshTokenServiceBindings.REFRESH_REPOSITORY)
    .toClass(RefreshTokenRepository);

  // Bind Secret
  app
    .bind(auth.TokenServiceBindings.TOKEN_SECRET)
    .to(process.env.JWT_SECRET ?? 'fallback-secret-if-env-fails');

  // Access Token Expiration (1 hour)
  app
    .bind(auth.TokenServiceBindings.TOKEN_EXPIRES_IN)
    .to(process.env.JWT_EXPIRES_IN ?? '3600');

  // Refresh Token Expiration (30 days)
  app
    .bind(auth.RefreshTokenServiceBindings.REFRESH_EXPIRES_IN)
    .to(process.env.REFRESH_EXPIRES_IN ?? '2592000');

  // Allows the JWT system to query User collection
  app.dataSource(
    MoneyManageDbDataSource,
    auth.UserServiceBindings.DATASOURCE_NAME,
  );
}
