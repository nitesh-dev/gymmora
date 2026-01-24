import { useCallback, useEffect, useState } from 'react';
import { ExerciseService } from '../services/exercise-service';
import { workoutService } from '../services/workout-service';

export function useExerciseDetailViewModel(id: number) {
  const [exercise, setExercise] = useState<any>(null); // TODO: Define full type
  const [history, setHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExerciseDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const [data, progressHistory] = await Promise.all([
        ExerciseService.getExerciseById(id),
        workoutService.getExerciseHistory(id),
      ]);
      setExercise(data);
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
