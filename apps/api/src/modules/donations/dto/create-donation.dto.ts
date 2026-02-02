import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateDonationSchema = z.object({
  postId: z.string().uuid('Post ID không hợp lệ'),
  amount: z
    .number({ required_error: 'Số tiền quyên góp là bắt buộc' })
    .positive('Số tiền phải lớn hơn 0'),
  isAnonymous: z.boolean().default(false),
  message: z
    .string()
    .max(500, 'Lời nhắn không được vượt quá 500 ký tự')
    .optional(),
});

export class CreateDonationDto extends createZodDto(CreateDonationSchema) {}
