import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { PasswordSchema } from '@/common/dto/password.dto';

export const RegisterSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    username: z.string().min(3, 'Username phải từ 3 ký tự').max(30),
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export class RegisterDto extends createZodDto(RegisterSchema) {}
