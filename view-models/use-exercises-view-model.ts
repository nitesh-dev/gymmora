import { ExerciseWithMuscleGroupsAndEquipment } from '@/db/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExerciseService } from '../services/exercise-service';

export function useExercisesViewModel() {
  const [exerciseList, setExerciseList] = useState<ExerciseWithMuscleGroupsAndEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);
  const [equipmentList, setEquipmentList] = useState<string[]>([]);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    // Clear existing timeout
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    setIsLoading(true);
    
    searchTimeout.current = setTimeout(async () => {
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
    }, 300);
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
