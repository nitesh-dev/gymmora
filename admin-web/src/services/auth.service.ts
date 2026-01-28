import type { AdminUser } from '../models/auth';
import { api } from './api';
import { supabase } from './supabase';

export class AuthService {
  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    return this.getAdminProfile();
  }

  async getAdminProfile(): Promise<AdminUser | null> {
    try {
      const data = await api.get<any>('/users/me');
      
      if (!data || data.role !== 'ADMIN') {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        createdAt: data.createdAt,
      };
    } catch (error) {
      console.error('Failed to fetch admin profile:', error);
      return null;
    }
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}

export const authService = new AuthService();
