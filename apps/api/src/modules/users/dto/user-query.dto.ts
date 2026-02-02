import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { BaseQuerySchema } from '@/common/dto/pagination.dto';

export const UserQuerySchema = BaseQuerySchema.extend({
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export class UserQueryDto extends createZodDto(UserQuerySchema) {}
