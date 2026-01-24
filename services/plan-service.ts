import { getDb } from '@/db/client';
import * as schema from '@/db/schema';
import { planDayExercises, planDays, workoutPlans } from '@/db/schema';
import { WorkoutPlanWithDays } from '@/db/types';
import { eq } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

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

interface ImportedPlanData {
  name: string;
  days: {
    dayOfWeek: number | string;
    dayLabel?: string;
    isRestDay?: boolean;
    exercises?: {
      exerciseId: number | string;
      sets: number | string;
      reps: number | string;
      order: number | string;
    }[];
  }[];
}

export const planService = {
  async getPlans(): Promise<WorkoutPlanWithDays[]> {
    const db = await getDb();
    if (!db) return [];
    
    return await db.query.workoutPlans.findMany({
      orderBy: (plans, { desc }) => [desc(plans.createdAt)],
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
    if (!db) return null;
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
    return await db.transaction(async (tx: ExpoSQLiteDatabase<typeof schema>) => {
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

    return await db.transaction(async (tx: ExpoSQLiteDatabase<typeof schema>) => {
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

  async exportAllCustomPlans() {
    const plans = await this.getPlans();
    const customPlans = plans.filter((p) => p.type === 'CUSTOM');
    
    const exportData = customPlans.map((plan) => ({
      name: plan.name,
      days: plan.days.map((day) => ({
        dayOfWeek: day.dayOfWeek,
        dayLabel: day.dayLabel,
        isRestDay: day.isRestDay,
        exercises: day.exercises.map((ex) => ({
          exerciseId: ex.exerciseId,
          sets: ex.sets,
          reps: ex.reps,
          order: ex.exerciseOrder,
        })),
      })),
    }));

    return JSON.stringify(exportData, null, 2);
  },

  async validateAndImportPlans(jsonContent: string) {
    try {
      const data = JSON.parse(jsonContent);
      const plansArray = Array.isArray(data) ? data : [data];
      
      const results = [];
      for (const planData of plansArray as ImportedPlanData[]) {
        // Basic validation
        if (!planData.name || !Array.isArray(planData.days)) {
          console.warn(`Skipping invalid plan: ${planData.name || 'Unknown'}`);
          continue;
        }

        // Ensure all 7 days are represented (0=Sun to 6=Sat)
        const importedDaysMap = new Map<number, ImportedPlanData['days'][0]>(
          planData.days.map((d) => [Number(d.dayOfWeek), d])
        );

        const planToCreate: CreatePlanData = {
          name: `${planData.name} (Imported)`,
          type: 'CUSTOM',
          days: Array.from({ length: 7 }, (_, i) => i).map((dow) => {
            const importedDay = importedDaysMap.get(dow);
            if (importedDay) {
              return {
                dayOfWeek: dow,
                dayLabel: importedDay.dayLabel || '',
                isRestDay: !!importedDay.isRestDay,
                exercises: (importedDay.exercises || []).map((ex) => ({
                  exerciseId: Number(ex.exerciseId),
                  sets: Number(ex.sets),
                  reps: Number(ex.reps),
                  order: Number(ex.order),
                })),
              };
            }
            // Missing day - defaults to Rest Day
            return {
              dayOfWeek: dow,
              dayLabel: 'Rest Day',
              isRestDay: true,
              exercises: [],
            };
          }),
        };

        results.push(await this.createPlan(planToCreate));
      }
      return results;
    } catch (error) {
      console.error('Import error:', error);
      throw error instanceof Error ? error : new Error('Failed to parse plan file');
    }
  },

  getPlanTemplate() {
    const template = [
      {
        name: "Example Plan Name",
        days: [
          {
            dayOfWeek: 1,
            dayLabel: "Push Day",
            isRestDay: false,
            exercises: [
              {
                exerciseId: 1,
                sets: 3,
                reps: 12,
                order: 1
              }
            ]
          }
        ]
      }
    ];
    return JSON.stringify(template, null, 2);
  }
};
