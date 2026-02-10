import { DonationStatus } from './enums';
import { LumisPost } from './post.type';
import { User } from './user.type';

export interface Donation {
  id: string;
  amount: number | string; // Decimal
  isAnonymous: boolean;
  status: DonationStatus;
  donorId: string;
  donor?: User;
  postId: string;
  post?: LumisPost;
  createdAt: Date | string;
}
