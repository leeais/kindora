import { createZodDto } from 'nestjs-zod';

import { BaseQuerySchema } from '@/common/dto/pagination.dto';

export const CategoryQuerySchema = BaseQuerySchema.extend({});

export class CategoryQueryDto extends createZodDto(CategoryQuerySchema) {}
