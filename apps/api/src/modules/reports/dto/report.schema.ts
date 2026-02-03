import z from 'zod';

import { BaseQuerySchema } from '@/common/dto/pagination.dto';

export const CreateReportSchema = z.object({
  targetId: z.string().uuid('ID mục tiêu không hợp lệ'),
  targetType: z.enum(['POST', 'COMMENT', 'USER']),
  reason: z.string().min(1, 'Lý do báo cáo không được để trống'),
  details: z.string().optional(),
});

export const ReportQuerySchema = BaseQuerySchema.extend({
  targetType: z.enum(['POST', 'COMMENT', 'USER']).optional(),
  status: z.enum(['PENDING', 'RESOLVED', 'REJECTED']).optional(),
});

export const UpdateReportStatusSchema = z.object({
  status: z.enum(['RESOLVED', 'REJECTED']),
  adminNote: z.string().optional(),
});
