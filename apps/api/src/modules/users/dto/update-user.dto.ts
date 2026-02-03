import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

import { UserRole } from '@/db/generated/prisma/client';
import { CreateUserSchema } from '@/modules/users/dto/create-user.dto';

export const UpdateUserSchema = CreateUserSchema.partial().extend({
  role: z.nativeEnum(UserRole).optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {}

export const UpdateRoleSchema = z.object({
  role: z.nativeEnum(UserRole, {
    required_error: 'Role là bắt buộc',
    invalid_type_error: 'Role không hợp lệ',
  }),
});

export class UpdateRoleDto extends createZodDto(UpdateRoleSchema) {}
