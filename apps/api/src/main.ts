import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ZodValidationPipe());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const nodeEnv = configService.get<string>('NODE_ENV');

  app.setGlobalPrefix('api', {
    exclude: ['healthy'],
  });

  await app.listen(port ?? 8080, async () => {
    const logger = new Logger(nodeEnv?.toUpperCase() as string);
    logger.log(`Application is running on: ${await app.getUrl()}`);
  });
}
bootstrap();
