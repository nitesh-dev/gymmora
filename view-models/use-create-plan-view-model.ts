import { Exercise, ExerciseWithMuscleGroupsAndEquipment } from '@/db/types';
import { ExerciseService } from '@/services/exercise-service';
import { planService } from '@/services/plan-service';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

export interface PlanDayState {
  dayOfWeek: number;
  dayLabel: string;
  isRestDay: boolean;
  exercises: {
    exerciseId: number;
    title: string;
    sets: number;
    reps: number;
    order: number;
  }[];
}

export function useCreatePlanViewModel(planId?: number) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [days, setDays] = useState<PlanDayState[]>(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      dayLabel: '',
      isRestDay: i === 0 || i === 6, // Default Sat/Sun as rest days
      exercises: [],
    }))
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!planId);
  
  // Use refs to avoid unstable function identities for the header
  const nameRef = useRef(name);
  const daysRef = useRef(days);
  
  useEffect(() => {
    nameRef.current = name;
  }, [name]);
  
  useEffect(() => {
    daysRef.current = days;
  }, [days]);

  // Load existing plan if planId is provided
  useEffect(() => {
    if (planId) {
      const loadPlan = async () => {
        try {
          const plan = await planService.getPlanById(planId);
          if (plan) {
            setName(plan.name);
            
            // Map days from DB to state
            const stateDays: PlanDayState[] = Array.from({ length: 7 }, (_, i) => {
              const dbDay = plan.days.find((d) => d.dayOfWeek === i);
              if (dbDay) {
                return {
                  dayOfWeek: i,
                  dayLabel: dbDay.dayLabel || '',
                  isRestDay: dbDay.isRestDay,
                  exercises: dbDay.exercises.map((de) => ({
                    exerciseId: de.exerciseId,
                    title: de.exercise?.title || 'Unknown',
                    sets: de.sets,
                    reps: de.reps,
                    order: de.exerciseOrder,
                  })).sort((a, b) => a.order - b.order)
                };
              }
              return {
                dayOfWeek: i,
                dayLabel: '',
                isRestDay: true,
                exercises: []
              };
            });
            setDays(stateDays);
          }
        } catch (error) {
          console.error('Failed to load plan for editing:', error);
          Alert.alert('Error', 'Failed to load plan');
        } finally {
          setIsLoading(false);
        }
      };
      loadPlan();
    }
  }, [planId]);

  // Search/Picker State
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [searchResults, setSearchResults] = useState<ExerciseWithMuscleGroupsAndEquipment[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);

  useEffect(() => {
    const fetchMuscles = async () => {
      const muscles = await ExerciseService.getUniqueMuscleGroups();
      setMuscleGroups(muscles);
    };
    fetchMuscles();
  }, []);

  // Keep track of search timeout for debouncing
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchExercises = async (text: string, muscle: string | null = selectedMuscleGroup) => {
    setExerciseSearch(text);

    // Clear existing timeout
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (text.length > 1 || muscle) {
      setIsSearching(true);

      // Debounce the actual search
      searchTimeout.current = setTimeout(async () => {
        try {
          const results = await ExerciseService.getExercises({
            search: text,
            muscleGroup: muscle || undefined
          });
          setSearchResults(results.slice(0, 30));
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsSearching(false);
        }
      }, 300); // 300ms debounce
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const setFilterAndSearch = (muscle: string | null) => {
    setSelectedMuscleGroup(muscle);
    handleSearchExercises(exerciseSearch, muscle);
  };

  const toggleRestDay = (dayIndex: number) => {
    setDays(prev => prev.map((day, i) =>
      i === dayIndex ? { ...day, isRestDay: !day.isRestDay } : day
    ));
  };

  const updateDayLabel = (dayIndex: number, label: string) => {
    setDays(prev => prev.map((day, i) =>
      i === dayIndex ? { ...day, dayLabel: label } : day
    ));
  };

  const addExerciseToDay = (dayIndex: number, exercise: Exercise) => {
    setDays(prev => prev.map((day, i) => {
      if (i === dayIndex) {
        const exists = day.exercises.some(ex => ex.exerciseId === exercise.id);
        if (exists) {
          return {
            ...day,
            exercises: day.exercises.filter(ex => ex.exerciseId !== exercise.id)
          };
        }
        return {
          ...day,
          exercises: [
            ...day.exercises,
            {
              exerciseId: exercise.id,
              title: exercise.title,
              sets: 3,
              reps: 10,
              order: day.exercises.length,
            }
          ]
        };
      }
      return day;
    }));
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseId: number) => {
    setDays(prev => prev.map((day, i) => {
      if (i === dayIndex) {
        return {
          ...day,
          exercises: day.exercises.filter(ex => ex.exerciseId !== exerciseId)
        };
      }
      return day;
    }));
  };

  const updateExerciseSetsReps = (dayIndex: number, exerciseId: number, sets: number, reps: number) => {
    setDays(prev => prev.map((day, i) => {
      if (i === dayIndex) {
        return {
          ...day,
          exercises: day.exercises.map(ex =>
            ex.exerciseId === exerciseId ? { ...ex, sets, reps } : ex
          )
        };
      }
      return day;
    }));
  };

  const savePlan = useCallback(async () => {
    const currentName = nameRef.current;
    const currentDays = daysRef.current;

    console.log('Attempting to save plan with name:', currentName);
    if (!currentName.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    setIsSaving(true);
    try {
      if (planId) {
        console.log('Updating plan:', planId);
        await planService.updatePlan(planId, {
          name: currentName,
          type: 'CUSTOM',
          days: currentDays.map(day => ({
            dayOfWeek: day.dayOfWeek,
            dayLabel: day.dayLabel,
            isRestDay: day.isRestDay,
            exercises: day.exercises.map(ex => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              order: ex.order,
            })),
          })),
        });
      } else {
        console.log('Saving plan:', currentName);
        await planService.createPlan({
          name: currentName,
          type: 'CUSTOM',
          days: currentDays.map(day => ({
            dayOfWeek: day.dayOfWeek,
            dayLabel: day.dayLabel,
            isRestDay: day.isRestDay,
            exercises: day.exercises.map(ex => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              order: ex.order,
            })),
          })),
        });
      }
      console.log('Plan saved successfully');
      router.back();
    } catch (error) {
      console.error('Failed to save plan:', error);
      Alert.alert('Error', 'Failed to save plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [router, planId]); // Added planId to dependencies

  return {
    name,
    setName,
    days,
    toggleRestDay,
    updateDayLabel,
    addExerciseToDay,
    removeExerciseFromDay,
    updateExerciseSetsReps,
    savePlan,
    isSaving,
    isLoading, // Export isLoading
    // Picker exports
    exerciseSearch,
    searchResults,
    isSearching,
    selectedMuscleGroup,
    muscleGroups,
    handleSearchExercises,
    setFilterAndSearch
  };
}
