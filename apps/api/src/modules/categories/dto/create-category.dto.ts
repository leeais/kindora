import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z
    .string({ required_error: 'Tên danh mục là bắt buộc' })
    .min(2, 'Tên quá ngắn'),
  slug: z.string({ required_error: 'Slug là bắt buộc' }),
  icon: z.string().optional(),
  description: z.string().optional(),
});

export class CreateCategoryDto extends createZodDto(CreateCategorySchema) {}

export const UpdateCategorySchema = CreateCategorySchema.partial();
export class UpdateCategoryDto extends createZodDto(UpdateCategorySchema) {}
