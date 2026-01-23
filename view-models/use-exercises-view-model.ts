import { useCallback, useEffect, useState } from 'react';
import { exercises } from '../db/schema';
import { ExerciseService } from '../services/exercise-service';

// Infer the type from the schema or service
export type Exercise = typeof exercises.$inferSelect;

export function useExercisesViewModel() {
  const [exerciseList, setExerciseList] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);

  const fetchFilters = useCallback(async () => {
    try {
      const [mgs, eqs] = await Promise.all([
        ExerciseService.getUniqueMuscleGroups(),
        ExerciseService.getUniqueEquipment()
      ]);
      setMuscleGroups(mgs);
      setEquipmentList(eqs);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  }, []);

  const fetchExercises = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ExerciseService.getExercises({
        search: searchQuery,
        muscleGroup: selectedMuscleGroup || undefined,
        equipment: selectedEquipment || undefined
      });
      setExerciseList(data);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedMuscleGroup, selectedEquipment]);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const addTestExercise = async () => {
    try {
      await ExerciseService.addMockExercise();
      await fetchExercises(); // Refresh list after adding
    } catch (error) {
      console.error('Error adding test exercise:', error);
    }
  };

  return {
    exerciseList,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedEquipment,
    setSelectedEquipment,
    muscleGroups,
    equipmentList,
    refresh: fetchExercises,
    addTestExercise
  };
}
