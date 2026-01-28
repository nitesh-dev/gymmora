import { userRepository } from '../repositories/user.repository';

export class UserService {
  async getAllUsers() {
    const users = await userRepository.findAll();
    return users.map(u => ({
      ...u,
      createdAt: u.createdAt.toISOString()
    }));
  }

  async createUser(data: { name: string; email: string }) {
    const user = await userRepository.create(data);
    return {
      ...user,
      createdAt: user.createdAt.toISOString()
    };
  }
}

export const userService = new UserService();
