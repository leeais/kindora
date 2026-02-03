import { createZodDto } from 'nestjs-zod';

import { BaseQuerySchema } from '@/common/dto/pagination.dto';

export const CommentQuerySchema = BaseQuerySchema.extend({});

export class CommentQueryDto extends createZodDto(CommentQuerySchema) {}
