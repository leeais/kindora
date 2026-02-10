import { LumisPost } from './post.type';
import { User } from './user.type';

export interface PostLike {
  id: string;
  userId: string;
  user?: User;
  postId: string;
  post?: LumisPost;
  createdAt: Date | string;
}

export interface Notification {
  id: string;
  title: string;
  content: string;
  type: string;
  metadata?: any; // Json
  isRead: boolean;
  userId: string;
  user?: User;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  actor?: User;
  targetId?: string | null;
  targetType?: string | null;
  payload?: any; // Json
  createdAt: Date | string;
}

export interface Report {
  id: string;
  reason: string;
  details?: string | null;
  reporterId: string;
  reporter?: User;
  targetId: string;
  targetType: string;
  status: string;
  adminNote?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}
