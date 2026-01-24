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
    if (!db) return;
    await db.delete(workoutPlans).where(eq(workoutPlans.id, id));
  },

  async activatePlan(id: number) {
    const db = await getDb();
    if (!db) return;

    // Deactivate all plans first
    await db.update(workoutPlans).set({ status: 'inactive' });
    
    // Activate the selected plan
    await db.update(workoutPlans)
      .set({ status: 'active' })
      .where(eq(workoutPlans.id, id));
  },

  async exportPlan(id: number) {
    const plan = await this.getPlanById(id);
    if (!plan) throw new Error('Plan not found');

    const exportData = {
      name: plan.name,
      type: 'CUSTOM', // Imported plans are always custom
      days: plan.days.map((day: any) => ({
        dayOfWeek: day.dayOfWeek,
        dayLabel: day.dayLabel,
        isRestDay: day.isRestDay,
        exercises: day.exercises.map((ex: any) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          order: ex.exerciseOrder,
        })),
      })),
    };

    return JSON.stringify(exportData, null, 2);
  },

  async validateAndImportPlan(jsonContent: string) {
    try {
      const data = JSON.parse(jsonContent);
      
      // Basic validation
      if (!data.name || !Array.isArray(data.days)) {
        throw new Error('Invalid plan format: Missing name or days');
      }

      // Ensure at least one exercise exists in the entire plan if not all rest days
      const hasExercises = data.days.some((d: any) => d.exercises && d.exercises.length > 0);
      const allRestDays = data.days.every((d: any) => d.isRestDay);
      
      if (!allRestDays && !hasExercises) {
        throw new Error('Invalid plan format: No exercises found in workout days');
      }

      // Convert to CreatePlanData format (ensuring type is CUSTOM)
      const planToCreate: CreatePlanData = {
        name: `${data.name} (Imported)`,
        type: 'CUSTOM',
        days: data.days.map((day: any) => ({
          dayOfWeek: day.dayOfWeek,
          dayLabel: day.dayLabel || '',
          isRestDay: !!day.isRestDay,
          exercises: (day.exercises || []).map((ex: any) => ({
            exerciseId: Number(ex.exerciseId),
            sets: Number(ex.sets),
            reps: Number(ex.reps),
            order: Number(ex.order),
          })),
        })),
      };

      return await this.createPlan(planToCreate);
    } catch (error) {
      console.error('Import error:', error);
      throw error instanceof Error ? error : new Error('Failed to parse plan file');
    }
  },

  getPlanTemplate() {
    const template = {
      name: "Example Plan Name",
      days: [
        {
          dayOfWeek: 1,
          dayLabel: "Push Day",
          isRestDay: false,
          exercises: [
            {
              exerciseId: 1, // Look up real IDs in the app
              sets: 3,
              reps: 12,
              order: 1
            }
          ]
        },
        {
          dayOfWeek: 2,
          dayLabel: "Rest Day",
          isRestDay: true,
          exercises: []
        }
      ]
    };
    return JSON.stringify(template, null, 2);
  }
};
