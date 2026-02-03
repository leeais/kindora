import { join } from 'path';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ZodSerializerInterceptor } from 'nestjs-zod';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuditLogInterceptor } from './modules/shared/audit-log/audit-log.interceptor';
import { AuditLogModule } from './modules/shared/audit-log/audit-log.module';
import { CleanupModule } from './modules/shared/cleanup/cleanup.module';
import { MailerModule } from './modules/shared/mailer/mailer.module';
import { AppQueueModule } from './modules/shared/queue/queue.module';

import { validate } from '@/common/configs/env.config';
import { LoggerMiddleware } from '@/common/middlewares/logger.middleware';
import { PrismaModule } from '@/db/prisma.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { CommentsModule } from '@/modules/comments/comments.module';
import { DashboardModule } from '@/modules/dashboard/dashboard.module';
import { DonationsModule } from '@/modules/donations/donations.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';
import { PaymentsModule } from '@/modules/payments/payments.module';
import { PostsModule } from '@/modules/posts/posts.module';
import { ReportsModule } from '@/modules/reports/reports.module';
import { UploadModule } from '@/modules/uploads/upload.module';
import { UsersModule } from '@/modules/users/users.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
      cache: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '/',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    UsersModule,
    PostsModule,
    CategoriesModule,
    CommentsModule,
    UploadModule,
    DonationsModule,
    NotificationsModule,
    PaymentsModule,
    DashboardModule,
    ReportsModule,
    AppQueueModule,
    MailerModule,
    AuditLogModule,
    CleanupModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
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
