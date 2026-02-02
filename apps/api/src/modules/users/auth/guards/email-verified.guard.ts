import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('Vui lòng đăng nhập');
    }

    if (!user.emailVerifiedAt && user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Vui lòng xác thực email để thực hiện hành động này',
      );
    }

    return true;
  }
}
