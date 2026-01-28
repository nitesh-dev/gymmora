import { userRepository } from '../repositories/user.repository';

export class UserService {
  async getAllUsers() {
    const users = await userRepository.findAll();
    return users.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
      lastSyncAt: u.lastSyncAt?.toISOString() || null
    }));
  }

  async getUserById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) return null;
    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      lastSyncAt: user.lastSyncAt?.toISOString() || null
    };
  }
}

export const userService = new UserService();
