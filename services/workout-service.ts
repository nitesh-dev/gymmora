import { getDb } from '@/db/client';
import * as schema from '@/db/schema';
import { planDays, setLogs, workoutLogs, workoutPlans } from '@/db/schema';
import { and, desc, eq, gte, lte } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';

export const workoutService = {
  async getRecentLogs(limit = 5) {
    const db = await getDb();
    if (!db) return [];

    return await db.query.workoutLogs.findMany({
      limit,
      orderBy: [desc(workoutLogs.date)],
      with: {
        planDay: {
          with: {
            plan: true,
          },
        },
      },
    });
  },

  async getAllLogs() {
    const db = await getDb();
    if (!db) return [];

    return await db.query.workoutLogs.findMany({
      orderBy: [desc(workoutLogs.date)],
      with: {
        planDay: {
          with: {
            plan: true,
          },
        },
        sets: {
          with: {
            exercise: true,
          }
        }
      },
    });
  },

  async getWorkoutLogById(id: number) {
    const db = await getDb();
    if (!db) return null;

    return await db.query.workoutLogs.findFirst({
      where: eq(workoutLogs.id, id),
      with: {
        planDay: {
          with: {
            plan: true,
          },
        },
        sets: {
          with: {
            exercise: true,
          }
        }
      },
    });
  },

  async getWeeklyActivity(startDate: Date, endDate: Date) {
    const db = await getDb();
    if (!db) return [];

    return await db.query.workoutLogs.findMany({
      where: and(
        gte(workoutLogs.date, startDate),
        lte(workoutLogs.date, endDate),
        eq(workoutLogs.status, 'COMPLETED')
      ),
    });
  },

  async getTodayWorkout() {
    const db = await getDb();
    if (!db) return null;

    const today = new Date().getDay(); // 0 is Sunday, 1 is Monday...

    // Fetch the active plan
    const activePlan = await db.query.workoutPlans.findFirst({
      where: eq(workoutPlans.status, 'active'),
    });

    if (!activePlan) return null;

    const todayPlanDay = await db.query.planDays.findFirst({
      where: and(
        eq(planDays.planId, activePlan.id),
        eq(planDays.dayOfWeek, today)
      ),
      with: {
        plan: true,
        exercises: {
          with: {
            exercise: true,
          },
        },
      },
    });

    return todayPlanDay || null;
  },

  async getPlanDayById(id: number) {
    const db = await getDb();
    if (!db) return null;

    return await db.query.planDays.findFirst({
      where: eq(planDays.id, id),
      with: {
        plan: true,
        exercises: {
          with: {
            exercise: true,
          },
        },
      },
    });
  },

  async saveWorkoutLog(data: { planDayId: number, duration: number, sets: { exerciseId: number, reps: number, weight?: string, setIndex: number }[] }) {
    const db = await getDb();
    if (!db) return null;

    return await db.transaction(async (tx: ExpoSQLiteDatabase<typeof schema>) => {
      const [log] = await tx.insert(workoutLogs).values({
        planDayId: data.planDayId,
        date: new Date(),
        duration: data.duration,
        status: 'COMPLETED',
      }).returning();

      for (const set of data.sets) {
        await tx.insert(setLogs).values({
          workoutLogId: log.id,
          exerciseId: set.exerciseId,
          repsDone: set.reps,
          weight: set.weight || '0',
          setIndex: set.setIndex,
        });
      }

      return log;
    });
  },

  async getWorkoutStats() {
    const db = await getDb();
    if (!db) return { totalWorkouts: 0, totalDuration: 0 };

    const logs = await db.select().from(workoutLogs).where(eq(workoutLogs.status, 'COMPLETED'));
    
    return {
      totalWorkouts: logs.length,
      totalDuration: logs.reduce((acc: number, log) => acc + (log.duration || 0), 0),
    };
  },

  async getVolumeHistory() {
    const db = await getDb();
    if (!db) return [];

    const logs = await db.query.workoutLogs.findMany({
      where: eq(workoutLogs.status, 'COMPLETED'),
      orderBy: [desc(workoutLogs.date)],
      with: {
        sets: true,
      },
    });

    const history = logs.map((log) => {
      const volume = log.sets.reduce((sum: number, set) => {
        const weight = parseFloat(set.weight) || 0;
        return sum + weight * set.repsDone;
      }, 0);
      return {
        date: log.date,
        volume,
      };
    });

    return history.reverse();
  },

  async getMuscleGroupStats() {
    const db = await getDb();
    if (!db) return [];

    const logs = await db.query.workoutLogs.findMany({
      where: eq(workoutLogs.status, 'COMPLETED'),
      with: {
        sets: {
          with: {
            exercise: {
              with: {
                muscleGroups: true,
              },
            },
          },
        },
      },
    });

    const muscleCounts: Record<string, number> = {};
    logs.forEach((log) => {
      log.sets.forEach((set) => {
        set.exercise?.muscleGroups.forEach((mg) => {
          muscleCounts[mg.name] = (muscleCounts[mg.name] || 0) + 1;
        });
      });
    });

    return Object.entries(muscleCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  },

  async getPersonalRecords() {
    const db = await getDb();
    if (!db) return [];

    const setsWithDetails = await db.query.setLogs.findMany({
      with: {
        exercise: true,
        workoutLog: true,
      },
    });

    const prs: Record<number, { exerciseId: number; exercise: string; maxWeight: number; date: Date }> = {};

    setsWithDetails.forEach((set) => {
      const weight = parseFloat(set.weight) || 0;
      if (!prs[set.exerciseId] || weight > prs[set.exerciseId].maxWeight) {
        prs[set.exerciseId] = {
          exerciseId: set.exerciseId,
          exercise: set.exercise.title,
          maxWeight: weight,
          date: set.workoutLog.date,
        };
      }
    });

    return Object.values(prs).sort((a, b) => b.maxWeight - a.maxWeight);
  },

  async getConsistencyData() {
    const db = await getDb();
    if (!db) return [];

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    return await db.query.workoutLogs.findMany({
      where: and(gte(workoutLogs.date, sixMonthsAgo), eq(workoutLogs.status, 'COMPLETED')),
      orderBy: [desc(workoutLogs.date)],
    });
  },

  async getExerciseHistory(exerciseId: number) {
    const db = await getDb();
    if (!db) return [];

    const history = await db.query.setLogs.findMany({
      where: eq(setLogs.exerciseId, exerciseId),
      with: {
        workoutLog: true,
      },
      orderBy: [desc(setLogs.id)], // Get logs, then we'll process by date
    });

    // Group by date and find max weight for each session
    const sessionMaxes: Record<string, { weight: number; date: Date; reps: number }> = {};

    history.forEach((log) => {
      const dateStr = new Date(log.workoutLog.date).toDateString();
      const weight = parseFloat(log.weight) || 0;
      
      if (!sessionMaxes[dateStr] || weight > sessionMaxes[dateStr].weight) {
        sessionMaxes[dateStr] = {
          weight,
          date: log.workoutLog.date,
          reps: log.repsDone,
        };
      }
    });

    return Object.values(sessionMaxes).sort((a, b) => a.date.getTime() - b.date.getTime());
  },
};
