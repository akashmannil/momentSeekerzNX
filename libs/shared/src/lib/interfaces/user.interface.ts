import { UserRole } from '../enums';

export interface User {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  userId: string;
  email: string;
  role: UserRole;
}
