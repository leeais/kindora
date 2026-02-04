import { join } from 'path';

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerModule as NestMailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

import { MailerService } from './mailer.service';

@Global()
@Module({
  imports: [
    NestMailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('SMTP_HOST');
        const port = configService.get('SMTP_PORT');
        const user = configService.get<string>('SMTP_USER');
        const pass = configService.get<string>('SMTP_PASS');
        const secure = Number(port) === 465;

        return {
          transport: {
            host,
            port,
            secure,
            auth: {
              user,
              pass,
            },
            logger: configService.get<string>('NODE_ENV') !== 'production',
            debug: configService.get<string>('NODE_ENV') !== 'production',
          },
          defaults: {
            from: `"Kindora Support" <${configService.get<string>('SMTP_FROM')}>`,
          },
          template: {
            dir: join(__dirname, 'templates'),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
