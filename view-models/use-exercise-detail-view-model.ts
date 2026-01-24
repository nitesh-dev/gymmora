import { ExerciseWithRelations } from '@/db/types';
import { useCallback, useEffect, useState } from 'react';
import { ExerciseService } from '../services/exercise-service';
import { workoutService } from '../services/workout-service';

export function useExerciseDetailViewModel(id: number) {
  const [exercise, setExercise] = useState<ExerciseWithRelations | null>(null);
  const [history, setHistory] = useState<{ weight: number; date: Date; reps: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExerciseDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, progressHistory] = await Promise.all([
        ExerciseService.getExerciseById(id),
        workoutService.getExerciseHistory(id),
      ]);
      setExercise(data as ExerciseWithRelations);
      setHistory(progressHistory);
    } catch (error) {
      console.error('Error fetching exercise details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExerciseDetail();
  }, [fetchExerciseDetail]);

  return {
    exercise,
    history,
    isLoading,
    refresh: fetchExerciseDetail
  };
}
