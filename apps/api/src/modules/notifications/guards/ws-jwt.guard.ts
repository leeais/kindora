import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client = context.switchToWs().getClient();
      const authToken =
        client.handshake.headers.authorization?.split(' ')[1] ||
        client.handshake.query.token;

      if (!authToken) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(authToken, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      // Attach user to handshake or socket
      client.user = payload;
      return true;
    } catch (err) {
      throw new WsException('Unauthorized');
    }
  }
}
