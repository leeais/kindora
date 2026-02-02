import { type UserContext, type UserRole } from '@/db/generated/prisma/enums';

declare global {
  namespace Express {
    interface User {
      userId: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
      providerId?: string;
      role?: UserRole;
      activeContext?: UserContext;
      sessionId?: string;
      refreshToken?: string;
      emailVerifiedAt?: Date | null;
    }

    interface Request {
      user?: User;
    }
  }
}
