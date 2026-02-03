import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { PaymentsService } from './payments.service';

import { PrismaService } from '@/db/prisma.service';


@Injectable()
export class PaymentsCronService {
  private readonly logger = new Logger(PaymentsCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkPendingDonations() {
    this.logger.log('Starting check for pending donations...');

    const pendingDonations = await this.prisma.donation.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: new Date(Date.now() - 15 * 60 * 1000), // Quá 15 phút
        },
      },
      take: 20, // Xử lý từng đợt
    });

    for (const donation of pendingDonations) {
      this.logger.debug(`Checking donation ${donation.id}...`);
      // Ở đây thực tế sẽ gọi API của Payment Gateway để kiểm tra
      // Tạm thời ta sẽ đánh dấu là FAILED nếu quá lâu
      // Hoặc logic cụ thể tùy thuộc provider

      // Demo logic: Auto expire
      await this.prisma.donation.update({
        where: { id: donation.id },
        data: { status: 'FAILED' },
      });
      this.logger.debug(
        `Donation ${donation.id} marked as FAILED due to timeout.`,
      );
    }
  }
}
