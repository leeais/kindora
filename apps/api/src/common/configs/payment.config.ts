import { registerAs } from '@nestjs/config';

export default registerAs('payment', () => ({
  bankId: process.env.PAYMENT_BANK_ID || 'MB', // Ví dụ: MB, VCB, TPB
  accountNo: process.env.PAYMENT_ACCOUNT_NO || '0000000000', // Số tài khoản hệ thống
  accountName: process.env.PAYMENT_ACCOUNT_NAME || 'KINDORA FUND',
  template: process.env.PAYMENT_TEMPLATE || 'compact', // compact, qronly, print
}));
