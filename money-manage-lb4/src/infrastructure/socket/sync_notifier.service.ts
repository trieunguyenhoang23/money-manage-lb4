import {BindingScope, inject, injectable} from '@loopback/core';
import {SocketService} from './socket.service';
import {
  SOCKET_SERVICE,
  SYNC_NOTIFIER_SERVICE,
} from '../binding_key.infrastructure';
import {RestBindings, Request} from '@loopback/rest';

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {key: SYNC_NOTIFIER_SERVICE.key},
})
export class SyncNotifyService {
  constructor(
    @inject(SOCKET_SERVICE.key) private socketService: SocketService,
    @inject(RestBindings.Http.REQUEST, {optional: true})
    private request: Request,
  ) {}

  public notifySyncCompleted(userId: string, type: string) {
    if (!this.socketService.io) return;

    const excludeSocketId = this.request?.headers['x-socket-id'] as string;

    let emitter = this.socketService.io.to(userId);

    if (excludeSocketId) {
      emitter = emitter.except(excludeSocketId);
    }

    emitter.emit('sync-completed', {type, timestamp: new Date().toISOString()});
  }
}
