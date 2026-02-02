import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PaymentService } from './payment.service';

import paymentConfig from '@/common/configs/payment.config';


@Module({
  imports: [ConfigModule.forFeature(paymentConfig)],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
