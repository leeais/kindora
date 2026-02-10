import { LumisPost } from './post.type';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  posts?: LumisPost[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
