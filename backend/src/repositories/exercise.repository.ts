import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { exerciseContent, exercises } from '../db/schema';

export class ExerciseRepository {
    async findAll() {
        return await db.select().from(exercises).where(eq(exercises.isDeleted, false));
    }

    async findById(id: string) {
        const [exercise] = await db.select().from(exercises).where(and(eq(exercises.id, id), eq(exercises.isDeleted, false)));
        return exercise;
    }

    async getExerciseWithContent(id: string) {
        const exercise = await this.findById(id);
        if (!exercise) return null;

        const content = await db.select().from(exerciseContent).where(eq(exerciseContent.exerciseId, id));
        return { ...exercise, content };
    }

    async create(data: typeof exercises.$inferInsert) {
        const [exercise] = await db.insert(exercises).values(data).returning();
        return exercise;
    }

    async createContent(data: typeof exerciseContent.$inferInsert[]) {
        return await db.insert(exerciseContent).values(data).returning();
    }

    async update(id: string, data: Partial<typeof exercises.$inferInsert>) {
        const [exercise] = await db.update(exercises)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(exercises.id, id))
            .returning();
        return exercise;
    }

    async delete(id: string) {
        const [exercise] = await db.update(exercises)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(exercises.id, id))
            .returning();
        return exercise;
    }
}

export const exerciseRepository = new ExerciseRepository();
