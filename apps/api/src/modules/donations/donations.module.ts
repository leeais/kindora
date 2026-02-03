import { Module } from '@nestjs/common';

import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';

import { PaymentModule } from '@/common/providers/payment/payment.module';

@Module({
  imports: [PaymentModule],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
