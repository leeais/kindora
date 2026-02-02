import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(3, 'Name must be at least 3 characters long'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email address'),
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {}
