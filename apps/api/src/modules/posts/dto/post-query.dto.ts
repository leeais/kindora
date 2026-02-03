import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { BaseQuerySchema } from '@/common/dto/pagination.dto';
import { PostStatus } from '@/db/generated/prisma/client';

export const PostQuerySchema = BaseQuerySchema.extend({
  title: z.string().optional(),
  status: z.nativeEnum(PostStatus).optional(),
  isUrgent: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
  authorId: z.string().uuid().optional(),
  isPostingForSelf: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
  currency: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  province: z.string().optional(),
  minTargetAmount: z.coerce.number().positive().optional(),
  maxTargetAmount: z.coerce.number().positive().optional(),
});

export class PostQueryDto extends createZodDto(PostQuerySchema) {}
