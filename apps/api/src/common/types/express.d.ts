import type { UserRole, UserContext } from '@prisma/client';

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
    }

    interface Request {
      user?: User;
    }
  }
}
