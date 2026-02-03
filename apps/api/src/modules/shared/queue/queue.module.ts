import { BullModule } from '@nestjs/bull';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get('REDIS_URL');
        if (url) {
          const parsedUrl = new URL(url);
          return {
            redis: {
              host: parsedUrl.hostname,
              port: Number(parsedUrl.port),
              password: parsedUrl.password,
              username: parsedUrl.username,
              tls: {
                servername: parsedUrl.hostname,
              },
            },
          };
        }
        return {
          redis: {
            host: config.get('REDIS_HOST'),
            port: config.get('REDIS_PORT'),
            password: config.get('REDIS_PASSWORD'),
          },
        };
      },
    }),
  ],
  exports: [BullModule],
})
export class AppQueueModule {}
