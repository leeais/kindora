import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z
    .string({ required_error: 'Tiêu đề là bắt buộc' })
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  content: z
    .string({ required_error: 'Nội dung là bắt buộc' })
    .min(20, 'Nội dung phải có ít nhất 20 ký tự'),
  currency: z.string().default('VND'),
  targetAmount: z
    .number({ required_error: 'Số tiền mục tiêu là bắt buộc' })
    .positive('Số tiền phải lớn hơn 0'),
  categoryId: z.string().uuid('Category ID không hợp lệ').optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  ward: z.string().optional(),
  isPostingForSelf: z.boolean().default(true),
  mediaIds: z.array(z.string().uuid()).optional(),
  proofs: z
    .array(
      z.object({
        mediaId: z.string().uuid('Media ID không hợp lệ'),
        isVisibleToPublic: z.boolean().default(false),
      }),
    )
    .optional(),
  bankDetails: z
    .object({
      bankName: z.string({ required_error: 'Tên ngân hàng là bắt buộc' }),
      accountNumber: z.string({ required_error: 'Số tài khoản là bắt buộc' }),
      accountHolder: z.string({
        required_error: 'Tên chủ tài khoản là bắt buộc',
      }),
      swiftCode: z.string().optional(),
    })
    .optional(),
});

export class CreatePostDto extends createZodDto(CreatePostSchema) {}
