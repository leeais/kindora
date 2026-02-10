export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum UserContext {
  LUMIS = 'LUMIS',
  KINDORA = 'KINDORA',
}

export enum PostStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  OPEN = 'OPEN',
  SUSPENDED = 'SUSPENDED',
  REJECTED_AFTER_REPORT = 'REJECTED_AFTER_REPORT',
  COMPLETED = 'COMPLETED',
  DELIVERED = 'DELIVERED',
  CLOSED = 'CLOSED',
}

export enum PostUpdateType {
  GENERAL = 'GENERAL',
  DELIVERY = 'DELIVERY',
}

export enum DonationStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}
