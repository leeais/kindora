import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateDeliverySchema = z.object({
  content: z.string({ required_error: 'Nội dung bằng chứng là bắt buộc' }),
  mediaIds: z
    .array(z.string().uuid())
    .min(1, 'Phải có ít nhất một hình ảnh/video bằng chứng'),
});

export class CreateDeliveryDto extends createZodDto(CreateDeliverySchema) {}
