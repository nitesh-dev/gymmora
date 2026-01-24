import { workoutService } from '@/services/workout-service';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useHomeViewModel() {
  const [todayWorkout, setTodayWorkout] = useState<any>(null);
  const [weeklyActivity, setWeeklyActivity] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalWorkouts: 0, totalDuration: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      endOfWeek.setHours(23, 59, 59, 999);

      const [workout, activity, currentStats] = await Promise.all([
        workoutService.getTodayWorkout(),
        workoutService.getWeeklyActivity(startOfWeek, endOfWeek),
        workoutService.getWorkoutStats(),
      ]);

      setTodayWorkout(workout);
      setWeeklyActivity(activity);
      setStats(currentStats);
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
    stats,
    isLoading,
    refresh: loadData,
  };
}
