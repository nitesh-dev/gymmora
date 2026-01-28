import type { User } from '../models/user';
import { api } from './api';

class UserService {
  async getAllUsers() {
    return api.get<User[]>('/users');
  }

  async getUserById(id: string) {
    return api.get<User>(`/users/${id}`);
  }

  async deleteUser(id: string) {
    return api.delete(`/users/${id}`);
  }

  async updateUserRole(id: string, role: 'USER' | 'ADMIN') {
    return api.patch<User>(`/users/${id}/role`, { role });
  }
}

export const userService = new UserService();
