import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuditLogService } from './audit-log.service';

export const AUDIT_LOG_KEY = 'audit_log_action';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger('AuditLog');

  constructor(
    private readonly reflector: Reflector,
    private readonly auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const action = this.reflector.get<string>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );
    if (!action) return next.handle();

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const actorId = user?.id;

    return next.handle().pipe(
      tap(async (data) => {
        if (!actorId) return;

        try {
          // Trích xuất targetId từ params hoặc response data nếu có
          const targetId = request.params.id || data?.id;
          const targetType = this.extractTargetType(context);

          await this.auditLogService.createLog({
            action,
            actorId,
            targetId,
            targetType,
            payload: {
              method: request.method,
              url: request.url,
              params: request.params,
              body: request.body,
              // Tránh lưu nhạy cảm
              // response: data
            },
          });
        } catch (error) {
          this.logger.error(`Failed to create audit log: ${error.message}`);
        }
      }),
    );
  }

  private extractTargetType(context: ExecutionContext): string {
    const className = context.getClass().name;
    return className.replace('Controller', '').toUpperCase();
  }
}
