import { createZodDto } from 'nestjs-zod';

import { BaseQuerySchema } from '@/common/dto/pagination.dto';

export const ReportQuerySchema = BaseQuerySchema.extend({});

export class ReportQueryDto extends createZodDto(ReportQuerySchema) {}
