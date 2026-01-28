import { and, eq, or } from 'drizzle-orm';
import { db } from '../db';
import { planDayExercises, planDays, planWeeks, workoutPlans } from '../db/schema';

export class PlanRepository {
    async findById(id: string) {
        const [plan] = await db.select().from(workoutPlans).where(and(eq(workoutPlans.id, id), eq(workoutPlans.isDeleted, false)));
        return plan;
    }

    async findUserPlans(userId: string) {
        return await db.select().from(workoutPlans)
            .where(and(
                eq(workoutPlans.userId, userId),
                eq(workoutPlans.isDeleted, false)
            ));
    }

    async findPublicPlans() {
        return await db.select().from(workoutPlans)
            .where(and(
                or(eq(workoutPlans.visibility, 'PUBLIC'), eq(workoutPlans.visibility, 'SYSTEM')),
                eq(workoutPlans.isDeleted, false)
            ));
    }

    async create(data: typeof workoutPlans.$inferInsert) {
        const [plan] = await db.insert(workoutPlans).values(data).returning();
        return plan;
    }

    async createStructure(
        weeks: (typeof planWeeks.$inferInsert)[],
        days: (typeof planDays.$inferInsert)[],
        exercises: (typeof planDayExercises.$inferInsert)[]
    ) {
        return await db.transaction(async (tx) => {
            const createdWeeks = await tx.insert(planWeeks).values(weeks).returning();
            const createdDays = await tx.insert(planDays).values(days).returning();
            const createdExercises = await tx.insert(planDayExercises).values(exercises).returning();
            return { weeks: createdWeeks, days: createdDays, exercises: createdExercises };
        });
    }

    async update(id: string, data: Partial<typeof workoutPlans.$inferInsert>) {
        const [plan] = await db.update(workoutPlans)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(workoutPlans.id, id))
            .returning();
        return plan;
    }

    async delete(id: string) {
        const [plan] = await db.update(workoutPlans)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(workoutPlans.id, id))
            .returning();
        return plan;
    }
}

export const planRepository = new PlanRepository();
