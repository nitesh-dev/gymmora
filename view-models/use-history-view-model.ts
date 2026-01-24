import { workoutService } from '@/services/workout-service';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function useHistoryViewModel() {
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const logs = await workoutService.getAllLogs();
      
      // Group by month
      const grouped: Record<string, any[]> = {};
      logs.forEach((log: any) => {
        const date = new Date(log.date);
        const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!grouped[monthYear]) {
          grouped[monthYear] = [];
        }
        
        // Calculate volume for the session and unique exercises
        const volume = log.sets.reduce((acc: number, set: any) => {
          const weight = parseFloat(set.weight) || 0;
          return acc + (weight * set.repsDone);
        }, 0);

        // Get unique exercises performed
        const exercisesMap = new Map();
        log.sets.forEach((set: any) => {
          if (set.exercise && !exercisesMap.has(set.exercise.id)) {
            exercisesMap.set(set.exercise.id, set.exercise.title);
          }
        });

        grouped[monthYear].push({
          ...log,
          totalSets: log.sets.length,
          totalVolume: volume,
          exercisesPerformed: Array.from(exercisesMap.values()),
        });
      });

      const sections = Object.entries(grouped).map(([title, data]) => ({
        title,
        data,
      }));

      setHistory(sections);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [loadHistory])
  );

  return {
    history,
    isLoading,
    refresh: loadHistory,
  };
}
