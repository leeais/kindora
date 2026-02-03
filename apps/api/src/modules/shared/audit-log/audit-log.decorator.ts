import { SetMetadata } from '@nestjs/common';

import { AUDIT_LOG_KEY } from './audit-log.interceptor';

export const AuditLog = (action: string) => SetMetadata(AUDIT_LOG_KEY, action);
