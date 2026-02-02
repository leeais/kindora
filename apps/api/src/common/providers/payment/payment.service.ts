import { Inject, Injectable } from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';

import paymentConfig from '@/common/configs/payment.config';

@Injectable()
export class PaymentService {
  constructor(
    @Inject(paymentConfig.KEY)
    private readonly config: ConfigType<typeof paymentConfig>,
  ) {}

  generateQrUrl(amount: number, content: string): string {
    const { bankId, accountNo, accountName, template } = this.config;

    // VietQR Quick Link format: https://img.vietqr.io/image/<BANK_ID>-<ACCOUNT_NO>-<TEMPLATE>.png
    const baseUrl = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;

    const params = new URLSearchParams({
      amount: amount.toString(),
      addInfo: content,
      accountName: accountName,
    });

    return `${baseUrl}?${params.toString()}`;
  }
}
