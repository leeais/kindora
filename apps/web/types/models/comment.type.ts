import { LumisPost } from './post.type';
import { User } from './user.type';

export interface Comment {
  id: string;
  content: string;
  userId: string;
  user?: User;
  postId: string;
  post?: LumisPost;
  parentId?: string | null;
  parent?: Comment | null;
  replies?: Comment[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
