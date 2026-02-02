import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Sử dụng đúng Enum từ Prisma Schema
export const UpdatePostStatusSchema = z.object({
  status: z.enum([
    'ACCEPTED',
    'REJECTED',
    'OPEN',
    'SUSPENDED',
    'COMPLETED',
    'CLOSED',
  ]),
  adminComments: z.string().optional(),
});

export class UpdatePostStatusDto extends createZodDto(UpdatePostStatusSchema) {}
