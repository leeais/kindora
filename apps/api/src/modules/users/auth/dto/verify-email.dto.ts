import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const VerifyEmailSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  code: z.string().length(6, 'Mã xác thực phải có 6 ký tự'),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}

export const ResendVerificationSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
});

export class ResendVerificationDto extends createZodDto(
  ResendVerificationSchema,
) {}
