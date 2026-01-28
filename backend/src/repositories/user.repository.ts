import { db } from '../db';
import { users } from '../db/schema';

export class UserRepository {
    async findAll() {
        return await db.select().from(users);
    }

    async create(data: { name: string; email: string }) {
        const [user] = await db.insert(users).values(data).returning();
        return user;
    }
}

export const userRepository = new UserRepository();
