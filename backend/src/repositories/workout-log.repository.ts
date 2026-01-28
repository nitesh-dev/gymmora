import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { setLogs, workoutLogs } from '../db/schema';

export class WorkoutLogRepository {
    async findUserLogs(userId: string) {
        return await db.select().from(workoutLogs)
            .where(and(
                eq(workoutLogs.userId, userId),
                eq(workoutLogs.isDeleted, false)
            ));
    }

    async findById(id: string) {
        const [log] = await db.select().from(workoutLogs)
            .where(and(eq(workoutLogs.id, id), eq(workoutLogs.isDeleted, false)));
        return log;
    }

    async getLogWithSets(id: string) {
        const log = await this.findById(id);
        if (!log) return null;

        const sets = await db.select().from(setLogs).where(eq(setLogs.workoutLogId, id));
        return { ...log, sets };
    }

    async create(data: typeof workoutLogs.$inferInsert) {
        const [log] = await db.insert(workoutLogs).values(data).returning();
        return log;
    }

    async createSets(data: (typeof setLogs.$inferInsert)[]) {
        return await db.insert(setLogs).values(data).returning();
    }

    async update(id: string, data: Partial<typeof workoutLogs.$inferInsert>) {
        const [log] = await db.update(workoutLogs)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(workoutLogs.id, id))
            .returning();
        return log;
    }

    async delete(id: string) {
        const [log] = await db.update(workoutLogs)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(workoutLogs.id, id))
            .returning();
        return log;
    }
}

export const workoutLogRepository = new WorkoutLogRepository();
