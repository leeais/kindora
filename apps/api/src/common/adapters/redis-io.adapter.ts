import { Logger, type INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

import type { ServerOptions } from 'socket.io';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;
  private logger = new Logger(RedisIoAdapter.name);

  constructor(private app: INestApplicationContext) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const configService = this.app.get(ConfigService);
    const redisUrl = configService.get<string>('REDIS_URL');

    let pubClient: Redis;
    let subClient: Redis;

    try {
      if (redisUrl) {
        this.logger.log(`Connecting to Redis via URL...`);
        pubClient = new Redis(redisUrl);
        subClient = pubClient.duplicate();
      } else {
        const host = configService.get<string>('REDIS_HOST');
        const port = configService.get<number>('REDIS_PORT');
        const password = configService.get<string>('REDIS_PASSWORD');

        this.logger.log(`Connecting to Redis via Host/Port: ${host}:${port}`);
        pubClient = new Redis({ host, port, password });
        subClient = pubClient.duplicate();
      }

      // Handle errors to prevent crash
      pubClient.on('error', (err) =>
        this.logger.error('Redis Pub Client Error:', err),
      );
      subClient.on('error', (err) =>
        this.logger.error('Redis Sub Client Error:', err),
      );

      this.adapterConstructor = createAdapter(pubClient, subClient);
      this.logger.log('Redis Adapter initialized successfully for WebSockets');
    } catch (e) {
      this.logger.error('Failed to initialize Redis Adapter', e);
    }
  }

  createIOServer(port: number, options?: ServerOptions): unknown {
    const server = super.createIOServer(port, options);
    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }
    return server;
  }
}
