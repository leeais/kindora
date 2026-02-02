import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

import { UserRole } from '@/db/generated/prisma/enums';

@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const targetId = request.params.id;

    if (!user) {
      throw new ForbiddenException('Vui lòng đăng nhập');
    }

    // Admin có quyền truy cập tất cả
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Nếu không phải admin, check xem có phải chủ sở hữu không
    if (user.userId !== targetId) {
      throw new ForbiddenException(
        'Bạn không có quyền truy cập tài nguyên này',
      );
    }

    return true;
  }
}
