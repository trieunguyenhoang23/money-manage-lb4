import {BindingScope, inject, injectable} from '@loopback/core';
import {Server} from 'socket.io';
import {SOCKET_SERVICE} from '../binding_key.infrastructure';
import {TokenService} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {SecurityBindings, UserProfile, securityId} from '@loopback/security';

@injectable({
  scope: BindingScope.SINGLETON,
  tags: {key: SOCKET_SERVICE.key},
})
export class SocketService {
  public io: Server;
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public tokenService: TokenService,
  ) {}

  async start(httpServer: any, options?: any) {
    const nativeServer = httpServer.server;
    if (!nativeServer) {
      console.error('Not found nativeServer from LoopBack HttpServer');
      return;
    }

    this.io = new Server(nativeServer, options);

    (nativeServer as any)._socketIO = this.io;

    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) return next(new Error('Token missing'));

        const userProfile = await this.tokenService.verifyToken(token);
        socket.data.userId = userProfile.id || userProfile[securityId];
        next();
      } catch (err) {
        next(new Error('Unauthorized'));
      }
    });

    this.io.on('connection', socket => {
      const userId = socket.data.userId; // get from middleware assigned

      if (userId) {
        socket.join(userId); // let user join their own room
        console.log(`✅ Socket connected: ${socket.id} - User: ${userId}`);
      }

      socket.on('disconnect', () => {
        console.log(`❌ User ${userId} disconnected`);
      });
    });
  }
}
