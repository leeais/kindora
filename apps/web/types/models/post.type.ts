import { Category } from './category.type';
import { Comment } from './comment.type';
import { Donation } from './donation.type';
import { PostStatus, MediaType, PostUpdateType } from './enums';
import { PostLike } from './interaction.type';
import { User } from './user.type';

export interface LumisPost {
  id: string;
  title: string;
  content: string;
  currency: string;
  targetAmount: number | string; // Decimal in Prisma is usually string or number in JS
  supportReceived: number | string;
  status: PostStatus;
  isPostingForSelf: boolean;
  isUrgent: boolean;
  adminComments?: string | null;
  authorId: string;
  author?: User;
  categoryId?: string | null;
  category?: Category | null;
  province?: string | null;
  district?: string | null;
  ward?: string | null;
  proofs?: ProofDocument[];
  bankDetails?: BankDetail[];
  donations?: Donation[];
  medias?: PostMedia[];
  likes?: PostLike[];
  comments?: Comment[];
  updates?: PostUpdate[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProofDocument {
  id: string;
  isVisibleToPublic: boolean;
  postId: string;
  post?: LumisPost;
  mediaId: string;
  media?: PostMedia;
  createdAt: Date | string;
}

export interface PostMedia {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  type: MediaType;
  metadata?: any; // Json
  postId?: string | null;
  post?: LumisPost | null;
  userId: string;
  user?: User;
  proofDocument?: ProofDocument | null;
  postUpdateId?: string | null;
  postUpdate?: PostUpdate | null;
  createdAt: Date | string;
}

export interface BankDetail {
  id: string;
  bankName: string;
  swiftCode?: string | null;
  accountNumber: string;
  accountHolder: string;
  postId: string;
  post?: LumisPost;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PostUpdate {
  id: string;
  title?: string | null;
  content: string;
  type: PostUpdateType;
  postId: string;
  post?: LumisPost;
  medias?: PostMedia[];
  createdAt: Date | string;
  updatedAt: Date | string;
}
