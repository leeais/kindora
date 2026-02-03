import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PrismaService } from '@/db/prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body } = request;

    // Chỉ log các thay đổi (POST, PATCH, DELETE)
    const trackedMethods = ['POST', 'PATCH', 'DELETE'];
    if (!trackedMethods.includes(method)) {
      return next.handle();
    }

    // Không log các endpoint nhạy cảm như login/register
    const ignoredUrls = ['/users/auth/login', '/users/auth/register'];
    if (ignoredUrls.some((u) => url.includes(u))) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (data) => {
        if (user && user.userId) {
          try {
            await this.prisma.auditLog.create({
              data: {
                action: `${method} ${url}`,
                actorId: user.userId,
                payload: body ? JSON.parse(JSON.stringify(body)) : {},
                targetId: data?.id || null,
                targetType: url.split('/')[1] || null,
              },
            });
          } catch (error) {
            console.error('AuditLog Error:', error);
          }
        }
      }),
    );
  }
}
