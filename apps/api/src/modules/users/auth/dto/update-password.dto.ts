import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { PasswordSchema } from '@/common/dto/password.dto';

export const UpdatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
    newPassword: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export class UpdatePasswordDto extends createZodDto(UpdatePasswordSchema) {}
