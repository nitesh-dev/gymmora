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

    async getFullPlanStructure(planId: string) {
        // Fetch plan
        const plan = await this.findById(planId);
        if (!plan) return null;

        // Fetch weeks
        const weeks = await db.select().from(planWeeks).where(eq(planWeeks.planId, planId));
        
        // Fetch days
        const weekIds = weeks.map(w => w.id);
        const days = weekIds.length > 0 
            ? await db.select().from(planDays).where(eq(planDays.weekId, weekIds[0])) // simplified for now, will fix below
            : [];
            
        // Actually we should fetch all days for all weeks
        const allDays = weekIds.length > 0 
            ? await db.select().from(planDays).where(or(...weekIds.map(id => eq(planDays.weekId, id))))
            : [];

        const dayIds = allDays.map(d => d.id);
        const allExercises = dayIds.length > 0
            ? await db.select().from(planDayExercises).where(or(...dayIds.map(id => eq(planDayExercises.planDayId, id))))
            : [];

        return {
            ...plan,
            weeks: weeks.map(w => ({
                ...w,
                days: allDays.filter(d => d.weekId === w.id).map(d => ({
                    ...d,
                    exercises: allExercises.filter(e => e.planDayId === d.id)
                }))
            }))
        };
    }

    async create(data: typeof workoutPlans.$inferInsert) {
        const [plan] = await db.insert(workoutPlans).values(data).returning();
        return plan;
    }

    async createFullPlan(planData: typeof workoutPlans.$inferInsert, structure: any) {
        return await db.transaction(async (tx) => {
            const [plan] = await tx.insert(workoutPlans).values(planData).returning();
            
            for (const week of structure.weeks) {
                const [newWeek] = await tx.insert(planWeeks).values({
                    planId: plan.id,
                    weekNumber: week.weekNumber,
                    label: week.label
                }).returning();

                for (const day of week.days) {
                    const [newDay] = await tx.insert(planDays).values({
                        weekId: newWeek.id,
                        dayOfWeek: day.dayOfWeek,
                        dayLabel: day.dayLabel,
                        isRestDay: day.isRestDay
                    }).returning();

                    if (!day.isRestDay && day.exercises) {
                        for (let i = 0; i < day.exercises.length; i++) {
                            const ex = day.exercises[i];
                            await tx.insert(planDayExercises).values({
                                planDayId: newDay.id,
                                exerciseId: ex.exerciseId,
                                sets: ex.sets,
                                reps: ex.reps,
                                exerciseOrder: i
                            });
                        }
                    }
                }
            }
            return plan;
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

    async updateStructure(planId: string, structure: any) {
        return await db.transaction(async (tx) => {
            // Delete existing structure to rebuild simplified (or we could do diffing, but rebuild is safer for a prototype)
            const weeks = await tx.select().from(planWeeks).where(eq(planWeeks.planId, planId));
            const weekIds = weeks.map(w => w.id);
            if (weekIds.length > 0) {
                const days = await tx.select().from(planDays).where(or(...weekIds.map(id => eq(planDays.weekId, id))));
                const dayIds = days.map(d => d.id);
                
                if (dayIds.length > 0) {
                    await tx.delete(planDayExercises).where(or(...dayIds.map(id => eq(planDayExercises.planDayId, id))));
                    await tx.delete(planDays).where(or(...weekIds.map(id => eq(planDays.weekId, id))));
                }
                await tx.delete(planWeeks).where(eq(planWeeks.planId, planId));
            }

            // Insert new structure
            for (const week of structure.weeks) {
                const [newWeek] = await tx.insert(planWeeks).values({
                    planId: planId,
                    weekNumber: week.weekNumber,
                    label: week.label
                }).returning();

                for (const day of week.days) {
                    const [newDay] = await tx.insert(planDays).values({
                        weekId: newWeek.id,
                        dayOfWeek: day.dayOfWeek,
                        dayLabel: day.dayLabel,
                        isRestDay: day.isRestDay
                    }).returning();

                    if (!day.isRestDay && day.exercises) {
                        for (let i = 0; i < day.exercises.length; i++) {
                            const ex = day.exercises[i];
                            await tx.insert(planDayExercises).values({
                                planDayId: newDay.id,
                                exerciseId: ex.exerciseId,
                                sets: ex.sets,
                                reps: ex.reps,
                                exerciseOrder: i
                            });
                        }
                    }
                }
            }
        });
    }
}

export const planRepository = new PlanRepository();
