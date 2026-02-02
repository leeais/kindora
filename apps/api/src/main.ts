import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from './app.module';

import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const nodeEnv = configService.get<string>('NODE_ENV');

  app.setGlobalPrefix('api', {
    exclude: ['healthz'],
  });

  await app.listen(port ?? 8080, async () => {
    const logger = new Logger(`MODE:${nodeEnv?.toUpperCase()}`);
    logger.log(`Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
