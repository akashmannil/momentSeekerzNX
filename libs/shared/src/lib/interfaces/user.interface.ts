import { PricingTier, SubscriptionStatus, UserRole } from '../enums';

export interface UserSubscriptionSummary {
  tier: PricingTier | null;
  status: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  subscription?: UserSubscriptionSummary;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
  subscription?: UserSubscriptionSummary;
}
