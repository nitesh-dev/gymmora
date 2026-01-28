import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { users } from '../db/schema';

export class UserRepository {
    async findAll() {
        return await db.select().from(users).where(eq(users.isDeleted, false));
    }

    async findById(id: string) {
        const [user] = await db.select().from(users).where(and(eq(users.id, id), eq(users.isDeleted, false)));
        return user;
    }

    async findByEmail(email: string) {
        const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.isDeleted, false)));
        return user;
    }

    async create(data: typeof users.$inferInsert) {
        const [user] = await db.insert(users).values(data).returning();
        return user;
    }

    async update(id: string, data: Partial<typeof users.$inferInsert>) {
        const [user] = await db.update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();
        return user;
    }
}

export const userRepository = new UserRepository();
