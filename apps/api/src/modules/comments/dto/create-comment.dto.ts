import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateCommentSchema = z.object({
  content: z
    .string({ required_error: 'Nội dung bình luận là bắt buộc' })
    .min(1, 'Nội dung không được để trống'),
  postId: z
    .string({ required_error: 'Post ID là bắt buộc' })
    .uuid('Post ID không hợp lệ'),
  parentId: z.string().uuid('Parent ID không hợp lệ').optional(),
});

export class CreateCommentDto extends createZodDto(CreateCommentSchema) {}
