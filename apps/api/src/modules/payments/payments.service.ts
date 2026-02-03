import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PaymentWebhookDto } from './dto/payment-webhook.dto';

import {
  verifyMomoSignature,
  verifyPayOSSignature,
} from '@/common/utils/crypto.util';
import { DonationsService } from '@/modules/donations/donations.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';


@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly donationsService: DonationsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleWebhook(dto: PaymentWebhookDto) {
    this.logger.log(
      `Received webhook from ${dto.provider} for order ${dto.orderId}`,
    );

    // Xác thực chữ ký (Signature Verification)
    const isValid = this.verifySignature(dto);
    if (!isValid) {
      this.logger.error(`Invalid signature for order ${dto.orderId}`);
      throw new BadRequestException('Invalid signature');
    }

    if (
      dto.status === 'SUCCESS' ||
      dto.status === '0' /* Momo success code */
    ) {
      try {
        const donation = (await this.donationsService.confirm(
          dto.orderId,
        )) as any;
        // Thực tế nên có một interface/type trả về từ donationsService.confirm chứa post thông tin

        // Notify donor
        await this.notificationsService.create({
          userId: donation.donorId,
          title: 'Quyên góp thành công!',
          content: `Cảm ơn bạn đã quyên góp ${donation.amount.toLocaleString()} VND cho bài viết.`,
          type: 'DONATION_SUCCESS',
          metadata: { donationId: donation.id, postId: donation.postId },
        });

        const post = (donation as any).post;
        if (post && post.authorId) {
          await this.notificationsService.create({
            userId: post.authorId,
            title: 'Có lượt quyên góp mới!',
            content: `Bài viết "${post.title}" vừa nhận được ${donation.amount.toLocaleString()} VND.`,
            type: 'NEW_DONATION',
            metadata: { donationId: donation.id, postId: donation.postId },
          });
        }

        return { success: true };
      } catch (error) {
        this.logger.error(`Failed to process payment: ${error.message}`);
        throw new BadRequestException('Failed to process payment');
      }
    }

    this.logger.warn(`Payment failed or pending for order ${dto.orderId}`);
    return { success: false, status: dto.status };
  }

  private verifySignature(dto: PaymentWebhookDto): boolean {
    if (dto.provider === 'MANUAL') return true; // Hoặc logic admin xác thực

    if (dto.provider === 'MOMO') {
      const secretKey = this.configService.get<string>('MOMO_SECRET_KEY');
      if (!secretKey) return true; // Developer mode hoặc chưa config
      return verifyMomoSignature(dto.rawData || {}, secretKey);
    }

    // Ví dụ PayOS hoặc khác
    if (dto.provider === 'VNPAY') {
      const checksumKey = this.configService.get<string>('PAYOS_CHECKSUM_KEY');
      if (!checksumKey) return true;
      return verifyPayOSSignature(
        dto.rawData || {},
        dto.signature || '',
        checksumKey,
      );
    }

    return true;
  }
}
