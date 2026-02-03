import { join } from 'path';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ZodSerializerInterceptor } from 'nestjs-zod';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppQueueModule } from './modules/shared/queue/queue.module';

import { validate } from '@/common/configs/env.config';
import { AuditLogInterceptor } from '@/common/interceptors/audit-log.interceptor';
import { LoggerMiddleware } from '@/common/middlewares/logger.middleware';
import { PrismaModule } from '@/db/prisma.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { DonationsModule } from '@/modules/donations/donations.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { PostsModule } from '@/modules/posts/posts.module';
import { UploadModule } from '@/modules/uploads/upload.module';
import { UsersModule } from '@/modules/users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      cache: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    PrismaModule,
    UsersModule,
    PostsModule,
    UploadModule,
    DonationsModule,
    NotificationsModule,
    PaymentsModule,
    DashboardModule,
    AppQueueModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ZodSerializerInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('{*path}');
  }
}
