import {BindingScope, injectable} from '@loopback/core';
import {Server} from 'socket.io';
import {Server as NodeHttpServer} from 'http';
import {SOCKET_SERVICE} from '../binding_key.infrastructure';

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {key: SOCKET_SERVICE.key},
})
export class SocketService {
  public io: Server;

  async start(httpServer: any, options?: any) {
    const nativeServer = httpServer.server;
    if (!nativeServer) {
      console.error('Not found nativeServer from LoopBack HttpServer');
      return;
    }

    this.io = new Server(nativeServer, options);

    (nativeServer as any)._socketIO = this.io;

    this.io.on('connection', socket => {
      console.log(`✅ Socket connected: ${socket.id}`);

      socket.on('store-user', (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined room`);
      });

      socket.on('disconnect', () => {
        console.log('User disconnected');
      });
    });
  }
}
