import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { ZodValidationPipe } from 'nestjs-zod';

import { AppModule } from './app.module';

import { loggerConfig } from '@/common/configs/logger.config';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: loggerConfig,
  });

  // Security & Performance
  app.use(cookieParser());
  app.use(helmet());
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(new ZodValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  const nodeEnv = configService.get<string>('NODE_ENV');

  app.setGlobalPrefix('api', {
    exclude: ['healthz'],
  });

  // Swagger Documentation
  if (nodeEnv !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Kindora API')
      .setDescription('The Kindora Platform API description')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('refreshToken')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  await app.listen(port ?? 8080, async () => {
    const logger = new Logger(`MODE:${nodeEnv?.toUpperCase()}`);
    logger.log(`Application is running on: ${await app.getUrl()}`);
    logger.log(`Swagger Docs available at: ${await app.getUrl()}/docs`);
  });
}
bootstrap();
