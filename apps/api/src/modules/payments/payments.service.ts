import { Injectable, Logger, BadRequestException } from '@nestjs/common';

import { PaymentWebhookDto } from './dto/payment-webhook.dto';

import { DonationsService } from '@/modules/donations/donations.service';
import { NotificationsService } from '@/modules/notifications/notifications.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly donationsService: DonationsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async handleWebhook(dto: PaymentWebhookDto) {
    this.logger.log(
      `Received webhook from ${dto.provider} for order ${dto.orderId}`,
    );

    // TODO: Verify signature based on provider key from ConfigService

    if (
      dto.status === 'SUCCESS' ||
      dto.status === '0' /* Momo success code */
    ) {
      try {
        const donation = await this.donationsService.confirm(dto.orderId);

        // Notify donor
        await this.notificationsService.create({
          userId: donation.donorId,
          title: 'Quyên góp thành công!',
          content: `Cảm ơn bạn đã quyên góp ${donation.amount.toLocaleString()} VND cho bài viết.`,
          type: 'DONATION_SUCCESS',
          metadata: { donationId: donation.id, postId: donation.postId },
        });

        // Notify post author (if confirm returns post info)
        // Note: donationsService.confirm returns donation which includes post via relation in some cases
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
}
