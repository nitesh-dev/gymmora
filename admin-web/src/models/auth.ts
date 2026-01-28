export type UserRole = 'USER' | 'ADMIN';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  createdAt: string;
}

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}
