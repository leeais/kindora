import { Module } from '@nestjs/common';

import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

import { DonationsModule } from '@/modules/donations/donations.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [DonationsModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService],
})
export class PaymentsModule {}
