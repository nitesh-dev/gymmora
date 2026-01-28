import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { userRoleEnum, users } from '../db/schema';

export class UserRepository {
    async findAll() {
        return await db.select().from(users).where(eq(users.isDeleted, false));
    }

    async findById(id: string) {
        const [user] = await db.select().from(users).where(
            and(
                eq(users.id, id),
                eq(users.isDeleted, false)
            )
        );
        return user;
    }

    async findByEmail(email: string) {
        const [user] = await db.select().from(users).where(
            and(
                eq(users.email, email),
                eq(users.isDeleted, false)
            )
        );
        return user;
    }

    async updateRole(id: string, role: typeof userRoleEnum.enumValues[number]) {
        const [user] = await db.update(users)
            .set({ role, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }

    async updateLastSync(id: string) {
        await db.update(users)
            .set({ lastSyncAt: new Date() })
            .where(eq(users.id, id));
    }

    async delete(id: string) {
        await db.update(users)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(users.id, id));
    }
}

export const userRepository = new UserRepository();
