import { Module } from '@nestjs/common';


import { PaymentsController } from './payments.controller';
import { PaymentsCronService } from './payments.cron.service';
import { PaymentsService } from './payments.service';

import { DonationsModule } from '@/modules/donations/donations.module';
import { NotificationsModule } from '@/modules/notifications/notifications.module';

@Module({
  imports: [DonationsModule, NotificationsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsCronService],
})
export class PaymentsModule {}
