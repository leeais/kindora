import { createZodDto } from 'nestjs-zod';

import { CreateUserSchema } from '@/modules/users/dto/create-user.dto';

export class UpdateUserDto extends createZodDto(CreateUserSchema.partial()) {}
