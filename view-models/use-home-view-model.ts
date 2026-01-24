import { workoutService } from '@/services/workout-service';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useHomeViewModel() {
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalDuration: 0, streak: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStreak = (logs: any[]) => {
    if (logs.length === 0) return 0;
    const sortedLogs = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const lastLogDate = new Date(sortedLogs[0].date);
    lastLogDate.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((currentDate.getTime() - lastLogDate.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 1) return 0;

    let checkDate = lastLogDate;
    const logDates = new Set(logs.map(l => new Date(l.date).toDateString()));

    while (logDates.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return streak;
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      // Weekly range
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      // Monthly range (last 30 days)
      const startOfMonth = new Date(now);
      startOfMonth.setDate(now.getDate() - 30);
      startOfMonth.setHours(0, 0, 0, 0);

      const [workout, activity, monthly, currentStats] = await Promise.all([
        workoutService.getTodayWorkout(),
        workoutService.getWeeklyActivity(startOfWeek, endOfWeek),
        workoutService.getWeeklyActivity(startOfMonth, now),
        workoutService.getWorkoutStats(),
      ]);

      setTodayWorkout(workout);
      setWeeklyActivity(activity);
      setMonthlyActivity(monthly);
      setStats({
        ...currentStats,
        streak: calculateStreak(monthly),
      });
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return {
    todayWorkout,
    weeklyActivity,
    monthlyActivity,
    stats,
    isLoading,
    refresh: loadData,
  };
}
