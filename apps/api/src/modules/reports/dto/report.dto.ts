import { createZodDto } from 'nestjs-zod';

import {
  CreateReportSchema,
  ReportQuerySchema,
  UpdateReportStatusSchema,
} from '@/modules/reports/dto/report.schema';

export class CreateReportDto extends createZodDto(CreateReportSchema) {}
export class ReportQueryDto extends createZodDto(ReportQuerySchema) {}
export class UpdateReportStatusDto extends createZodDto(
  UpdateReportStatusSchema,
) {}
