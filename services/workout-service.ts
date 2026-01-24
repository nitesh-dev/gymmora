import { getDb } from '@/db/client';
import { planDays, setLogs, workoutLogs, workoutPlans } from '@/db/schema';
import { and, desc, eq, gte, lte } from 'drizzle-orm';

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

    // For now, let's assume the "active" plan is the most recently created one
    // or maybe we should have an 'active' flag in the future.
    // Fetch the latest global plan to find what's scheduled for today
    const activePlan = await db.query.workoutPlans.findFirst({
      orderBy: [desc(workoutPlans.createdAt)],
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

  async saveWorkoutLog(data: { planDayId: number, duration: number, sets: any[] }) {
    const db = await getDb();
    if (!db) return null;

    return await db.transaction(async (tx: any) => {
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
      totalDuration: logs.reduce((acc: number, log: any) => acc + (log.duration || 0), 0),
    };
  }
};
