import { getDb } from '@/db/client';
import { planDayExercises, planDays, workoutPlans } from '@/db/schema';
import { eq } from 'drizzle-orm';

export interface CreatePlanData {
  name: string;
  type: 'CUSTOM' | 'SYSTEM';
  days: {
    dayOfWeek: number;
    dayLabel?: string;
    isRestDay: boolean;
    exercises: {
      exerciseId: number;
      sets: number;
      reps: number;
      order: number;
    }[];
  }[];
}

export const planService = {
  async getPlans() {
    const db = await getDb();
    if (!db) return [];
    
    return await db.query.workoutPlans.findMany({
      orderBy: (plans: any, { desc }: any) => [desc(plans.createdAt)],
      with: {
        days: {
          with: {
            exercises: {
              with: {
                exercise: true
              }
            }
          }
        }
      },
    });
  },

  async getPlanById(id: number) {
    const db = await getDb();
    return await db.query.workoutPlans.findFirst({
      where: eq(workoutPlans.id, id),
      with: {
        days: {
          with: {
            exercises: {
              with: {
                exercise: true
              }
            }
          }
        }
      }
    });
  },

  async createPlan(data: CreatePlanData) {
    const db = await getDb();
    if (!db) throw new Error('Database not initialized');

    console.log('Creating plan with data:', data);
    return await db.transaction(async (tx: any) => {
      // 1. Create the plan
      const insertResult = await tx.insert(workoutPlans).values({
        name: data.name,
        type: data.type,
        createdAt: new Date(),
      }).returning();

      if (!insertResult || insertResult.length === 0) {
        throw new Error('Failed to create plan: No response from database');
      }

      const newPlan = insertResult[0];

      // 2. Create the days
      for (const day of data.days) {
        const [newDay] = await tx.insert(planDays).values({
          planId: newPlan.id,
          dayOfWeek: day.dayOfWeek,
          dayLabel: day.dayLabel,
          isRestDay: day.isRestDay,
        }).returning();

        // 3. Create the exercises for this day
        if (day.exercises.length > 0) {
          await tx.insert(planDayExercises).values(
            day.exercises.map(ex => ({
              planDayId: newDay.id,
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              exerciseOrder: ex.order,
            }))
          );
        }
      }

      return newPlan;
    });
  },

  async updatePlan(id: number, data: CreatePlanData) {
    const db = await getDb();
    if (!db) throw new Error('Database not initialized');

    return await db.transaction(async (tx: any) => {
      // 1. Update the plan metadata
      await tx.update(workoutPlans)
        .set({ name: data.name })
        .where(eq(workoutPlans.id, id));

      // 2. Delete old days (this will cascade delete exercises)
      await tx.delete(planDays).where(eq(planDays.planId, id));

      // 3. Create the new days
      for (const day of data.days) {
        const [newDay] = await tx.insert(planDays).values({
          planId: id,
          dayOfWeek: day.dayOfWeek,
          dayLabel: day.dayLabel,
          isRestDay: day.isRestDay,
        }).returning();

        // 4. Create the exercises for this day
        if (day.exercises.length > 0) {
          await tx.insert(planDayExercises).values(
            day.exercises.map(ex => ({
              planDayId: newDay.id,
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              exerciseOrder: ex.order,
            }))
          );
        }
      }
    });
  },

  async deletePlan(id: number) {
    const db = await getDb();
    // Cascade delete is handled by the database schema references
    return await db.delete(workoutPlans).where(eq(workoutPlans.id, id));
  }
};
