import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

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
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z
      .string()
      .min(6, 'Mật khẩu xác nhận phải có ít nhất 6 ký tự'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}
