import { UserRole, UserContext } from './enums';

export interface User {
  id: string;
  email: string;
  username: string;
  password?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  age?: number | null;
  country?: string | null;
  address?: string | null;
  phoneNumber?: string | null;
  role: UserRole;
  activeContext: UserContext;
  coins: number;
  emailVerifiedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Session {
  id: string;
  refreshToken: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  expiresAt: Date | string;
  userId: string;
  user?: User;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SocialAccount {
  id: string;
  provider: string;
  providerId: string;
  userId: string;
  user?: User;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VerificationCode {
  id: string;
  code: string;
  userId: string;
  user?: User;
  type: string;
  expiresAt: Date | string;
  createdAt: Date | string;
}
