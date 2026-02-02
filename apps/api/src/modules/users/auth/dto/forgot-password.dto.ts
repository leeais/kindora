import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { PasswordSchema } from '@/common/dto/password.dto';

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}

export const VerifyResetCodeSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  code: z.string().length(6, 'Mã xác thực phải có 6 ký tự'),
});

export class VerifyResetCodeDto extends createZodDto(VerifyResetCodeSchema) {}

export const ResetPasswordSchema = z
  .object({
    resetToken: z.string({ required_error: 'Reset token là bắt buộc' }),
    password: PasswordSchema,
    confirmPassword: PasswordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
