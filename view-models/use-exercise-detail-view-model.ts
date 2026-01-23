import { useCallback, useEffect, useState } from 'react';
import { ExerciseService } from '../services/exercise-service';

export function useExerciseDetailViewModel(id: number) {
  const [exercise, setExercise] = useState<any>(null); // TODO: Define full type
  const [isLoading, setIsLoading] = useState(true);

  const fetchExerciseDetail = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ExerciseService.getExerciseById(id);
      setExercise(data);
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
    isLoading,
    refresh: fetchExerciseDetail
  };
}
