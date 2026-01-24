import { WorkoutLog } from '@/db/types';
import { workoutService } from '@/services/workout-service';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export interface ProgressSummary {
  totalWorkouts: number;
  totalVolume: number;
  activeStreak: number;
}

export function useProgressViewModel() {
  const [volumeHistory, setVolumeHistory] = useState<{ date: Date; volume: number }[]>([]);
  const [muscleStats, setMuscleStats] = useState<{ name: string; value: number }[]>([]);
  const [prs, setPrs] = useState<{ exerciseId: number; exercise: string; maxWeight: number; date: Date }[]>([]);
  const [consistencyLogs, setConsistencyLogs] = useState<WorkoutLog[]>([]);
  const [summary, setSummary] = useState<ProgressSummary>({
    totalWorkouts: 0,
    totalVolume: 0,
    activeStreak: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const calculateStreak = (logs: WorkoutLog[]) => {
    if (logs.length === 0) return 0;
    
    // Sort logs by date descending
    const sortedLogs = [...logs].sort((a, b) => b.date.getTime() - a.date.getTime());
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    // Check if last workout was today or yesterday
    const lastWorkoutDate = new Date(sortedLogs[0].date);
    lastWorkoutDate.setHours(0, 0, 0, 0);
    
    const diffTime = Math.abs(currentDate.getTime() - lastWorkoutDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) return 0; // Streak broken

    let expectedDate = lastWorkoutDate;
    
    for (const log of sortedLogs) {
      const logDate = new Date(log.date);
      logDate.setHours(0, 0, 0, 0);
      
      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (logDate.getTime() < expectedDate.getTime()) {
        // Find if there's multiple workouts on same day, skip them
        continue;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [volume, muscle, records, consistency] = await Promise.all([
        workoutService.getVolumeHistory(),
        workoutService.getMuscleGroupStats(),
        workoutService.getPersonalRecords(),
        workoutService.getConsistencyData(),
      ]);

      const totalVolume = volume.reduce((acc: number, curr) => acc + curr.volume, 0);
      const activeStreak = calculateStreak(consistency);

      setVolumeHistory(volume);
      setMuscleStats(muscle);
      setPrs(records);
      setConsistencyLogs(consistency);
      setSummary({
        totalWorkouts: consistency.length,
        totalVolume,
        activeStreak,
      });
    } catch (error) {
      console.error('Failed to load progress data:', error);
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
    volumeHistory,
    muscleStats,
    prs,
    consistencyLogs,
    summary,
    isLoading,
    refresh: loadData,
  };
}
