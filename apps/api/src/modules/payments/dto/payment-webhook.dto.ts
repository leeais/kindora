import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const PaymentWebhookSchema = z.object({
  provider: z.enum(['MOMO', 'VNPAY', 'ZALOPAY', 'MANUAL']),
  orderId: z.string(), // Phụ thuộc vào provider, thường là donationId của chúng ta
  amount: z.number(),
  status: z.string(),
  signature: z.string().optional(),
  rawData: z.record(z.any()).optional(),
});

export class PaymentWebhookDto extends createZodDto(PaymentWebhookSchema) {}
