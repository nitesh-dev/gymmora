import { useCallback, useEffect, useState } from 'react';
import { exercises } from '../db/schema';
import { ExerciseService } from '../services/exercise-service';

// Infer the type from the schema or service
export type Exercise = typeof exercises.$inferSelect;

export function useExercisesViewModel() {
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = searchQuery 
        ? await ExerciseService.searchExercises(searchQuery)
        : await ExerciseService.getAllExercises();
      setExerciseList(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  return {
    exerciseList,
    isLoading,
    searchQuery,
    setSearchQuery,
    refresh: fetchExercises
  };
}
