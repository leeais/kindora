import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';

import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() dto: PaymentWebhookDto) {
    return this.paymentsService.handleWebhook(dto);
  }
}
