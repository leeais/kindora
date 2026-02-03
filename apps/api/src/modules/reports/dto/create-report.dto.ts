import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateReportSchema = z.object({
  reason: z.string({ required_error: 'Lý do báo cáo là bắt buộc' }),
  details: z.string().optional(),
  targetId: z.string().uuid('ID mục tiêu không hợp lệ'),
  targetType: z.enum(['POST', 'COMMENT', 'USER']),
});

export class CreateReportDto extends createZodDto(CreateReportSchema) {}
