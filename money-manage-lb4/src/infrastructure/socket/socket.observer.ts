import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import {RestBindings, RestServer} from '@loopback/rest';
import {SocketService} from './socket.service';
import {SOCKET_SERVICE} from '../binding_key.infrastructure';

@lifeCycleObserver('socket-server')
export class SocketObserver implements LifeCycleObserver {
  constructor(
    @inject(RestBindings.SERVER) private restServer: RestServer,
    @inject(SOCKET_SERVICE.key) private socketService: SocketService,
  ) {}

  async start(): Promise<void> {
    const httpServer = this.restServer.httpServer;

    if (!httpServer?.server || !httpServer.server) {
      console.error('HTTP server not ready');
      return;
    }

    await this.socketService.start(httpServer, {
      path: '/socket.io',
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    console.log('🚀 Socket.io server started');
  }

  async stop(): Promise<void> {
    if (this.socketService.io) {
      this.socketService.io.close();
    }
  }
}
