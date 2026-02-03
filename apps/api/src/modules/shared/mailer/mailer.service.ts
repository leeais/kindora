import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly nestMailerService: NestMailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendMail(
    to: string,
    subject: string,
    template: string,
    context: Record<string, unknown>,
  ) {
    try {
      const info = await this.nestMailerService.sendMail({
        to,
        subject,
        template,
        context,
      });

      this.logger.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error.message);
      throw error;
    }
  }

  async sendVerificationCode(to: string, code: string) {
    return this.sendMail(
      to,
      'Mã xác thực tài khoản Kindora',
      './verification-code',
      {
        code,
      },
    );
  }

  async sendPasswordResetCode(to: string, code: string) {
    return this.sendMail(to, 'Đặt lại mật khẩu Kindora', './password-reset', {
      code,
    });
  }

  async sendWelcomeEmail(to: string, name: string) {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL');
    return this.sendMail(to, 'Chào mừng bạn đến với Kindora!', './welcome', {
      name,
      frontendUrl,
    });
  }

  async sendPasswordChangedEmail(to: string) {
    const time = new Date().toLocaleString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });
    return this.sendMail(
      to,
      'Thông báo bảo mật: Mật khẩu đã thay đổi',
      './password-changed',
      {
        time,
      },
    );
  }

  async sendPostApprovedEmail(
    to: string,
    name: string,
    postTitle: string,
    adminComments?: string,
  ) {
    return this.sendMail(
      to,
      '🌸 Bài viết của bạn đã được duyệt! (Bước tiếp theo)',
      './post-approved',
      {
        name,
        postTitle,
        adminComments,
      },
    );
  }

  async sendPostLiveEmail(
    to: string,
    name: string,
    postTitle: string,
    adminComments?: string,
  ) {
    return this.sendMail(
      to,
      '🌸 Bài viết của bạn đã chính thức công khai!',
      './post-live',
      {
        name,
        postTitle,
        adminComments,
      },
    );
  }

  async sendPostRejectedEmail(
    to: string,
    name: string,
    postTitle: string,
    reason: string,
  ) {
    return this.sendMail(
      to,
      '🌸 Thông báo về bài viết của bạn trên Kindora',
      './post-rejected',
      {
        name,
        postTitle,
        reason,
      },
    );
  }
}
