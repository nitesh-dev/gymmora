import { getDb } from '@/db/client';
import * as schema from '@/db/schema';
import { planDayExercises, planDays, planWeeks, workoutPlans } from '@/db/schema';
import { WorkoutPlanWithWeeks } from '@/db/types';
import { eq } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export interface CreatePlanData {
  name: string;
  type: 'CUSTOM' | 'SYSTEM';
  weeks: {
    weekNumber: number;
    label?: string;
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
  }[];
}

interface ImportedPlanData {
  name: string;
  weeks?: {
    weekNumber: number;
    label?: string;
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
  }[];
  // Backward compatibility for single week imports
  days?: {
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
  async getPlans(): Promise<WorkoutPlanWithWeeks[]> {
    const db = await getDb();
    if (!db) return [];

    const plans = await db.query.workoutPlans.findMany({
      with: {
        weeks: {
          with: {
            days: {
              with: {
                exercises: {
                  with: {
                    exercise: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return plans as unknown as WorkoutPlanWithWeeks[];
  },

  async getPlanById(id: number): Promise<WorkoutPlanWithWeeks | null> {
    const db = await getDb();
    if (!db) return null;

    const plan = await db.query.workoutPlans.findFirst({
      where: eq(workoutPlans.id, id),
      with: {
        weeks: {
          with: {
            days: {
              with: {
                exercises: {
                  with: {
                    exercise: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return (plan as unknown as WorkoutPlanWithWeeks) || null;
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

      // 2. Create the weeks
      for (const week of data.weeks) {
        const [newWeek] = await tx.insert(planWeeks).values({
          planId: newPlan.id,
          weekNumber: week.weekNumber,
          label: week.label,
        }).returning();

        // 3. Create the days for this week
        for (const day of week.days) {
          const [newDay] = await tx.insert(planDays).values({
            weekId: newWeek.id,
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

      // 2. Delete old weeks (this will cascade delete days and exercises)
      await tx.delete(planWeeks).where(eq(planWeeks.planId, id));

      // 3. Create the new weeks
      for (const week of data.weeks) {
        const [newWeek] = await tx.insert(planWeeks).values({
          planId: id,
          weekNumber: week.weekNumber,
          label: week.label,
        }).returning();

        // 4. Create the new days
        for (const day of week.days) {
          const [newDay] = await tx.insert(planDays).values({
            weekId: newWeek.id,
            dayOfWeek: day.dayOfWeek,
            dayLabel: day.dayLabel,
            isRestDay: day.isRestDay,
          }).returning();

          // 5. Create the exercises for this day
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
      .set({ status: 'active', currentWeek: 1 })
      .where(eq(workoutPlans.id, id));
  },

  async exportAllCustomPlans() {
    const plans = await this.getPlans();
    const customPlans = plans.filter((p) => p.type === 'CUSTOM');
    
    const exportData = customPlans.map((plan) => ({
      name: plan.name,
      weeks: plan.weeks.map((week) => ({
        weekNumber: week.weekNumber,
        label: week.label,
        days: week.days.map((day) => ({
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
      })),
    }));

    return JSON.stringify(exportData, null, 2);
  },

  async validateAndImportPlans(jsonContent: string) {
    try {
      const plans = JSON.parse(jsonContent);
      const importedPlans = Array.isArray(plans) ? plans : [plans];
      const results = [];

      for (const data of importedPlans) {
        const planData = data as ImportedPlanData;
        const planToCreate: CreatePlanData = {
          name: `${planData.name} (Imported)`,
          type: 'CUSTOM',
          weeks: [],
        };

        if (planData.weeks) {
          for (const weekData of planData.weeks) {
            const importedDaysMap = new Map<number, NonNullable<ImportedPlanData['weeks']>[number]['days'][number]>(
              weekData.days.map((d) => [Number(d.dayOfWeek), d])
            );

            planToCreate.weeks.push({
              weekNumber: weekData.weekNumber,
              label: weekData.label,
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
                return {
                  dayOfWeek: dow,
                  dayLabel: 'Rest Day',
                  isRestDay: true,
                  exercises: [],
                };
              }),
            });
          }
        } else if (planData.days) {
          // Fallback for single week structure
          const importedDaysMap = new Map<number, NonNullable<ImportedPlanData['days']>[number]>(
            planData.days.map((d) => [Number(d.dayOfWeek), d])
          );

          planToCreate.weeks.push({
            weekNumber: 1,
            label: 'Week 1',
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
              return {
                dayOfWeek: dow,
                dayLabel: 'Rest Day',
                isRestDay: true,
                exercises: [],
              };
            }),
          });
        }

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
        name: "Example Multi-Week Plan",
        weeks: [
          {
            weekNumber: 1,
            label: "Introduction Week",
            days: [
              {
                dayOfWeek: 1,
                dayLabel: "Full Body",
                isRestDay: false,
                exercises: [
                  { exerciseId: 1, sets: 3, reps: 12, order: 1 }
                ]
              }
            ]
          }
        ]
      }
    ];
    return JSON.stringify(template, null, 2);
  },

  async updateCurrentWeek(planId: number, weekNumber: number) {
    const db = await getDb();
    if (!db) return;
    await db.update(workoutPlans)
      .set({ currentWeek: weekNumber })
      .where(eq(workoutPlans.id, planId));
  }
};
