import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { BaseQuerySchema } from '@/common/dto/pagination.dto';

export const NotificationQuerySchema = BaseQuerySchema.extend({
  isRead: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
  type: z.string().optional(),
});

export class NotificationQueryDto extends createZodDto(
  NotificationQuerySchema,
) {}
