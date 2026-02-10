import { User } from '@/types/models/user.type';

export interface Response<T = any> {
  success: boolean;
  message: string;
  data: T;
  meta?: any;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    total: number;
    lastPage: number;
    currentPage: number;
    perPage: number;
    prev: number | null;
    next: number | null;
  };
}

export interface AuthData {
  accessToken?: string;
  expiresAt?: number;
  user: User;
}

export interface AuthResponse extends Response<AuthData> {}

export interface ErrorResponse extends Response<null> {}
