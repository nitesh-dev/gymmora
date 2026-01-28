export interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}
