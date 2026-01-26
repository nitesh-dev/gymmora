import { Exercise, ExerciseWithMuscleGroupsAndEquipment } from '@/db/types';
import { ExerciseService } from '@/services/exercise-service';
import { planService } from '@/services/plan-service';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

export interface ExerciseState {
  exerciseId: number;
  title: string;
  sets: number;
  reps: number;
  order: number;
}

export interface PlanDayState {
  dayOfWeek: number;
  dayLabel: string;
  isRestDay: boolean;
  exercises: ExerciseState[];
}

export interface PlanWeekState {
  weekNumber: number;
  label: string;
  days: PlanDayState[];
}

export function useCreatePlanViewModel(planId?: number) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [weeks, setWeeks] = useState<PlanWeekState[]>([
    {
      weekNumber: 1,
      label: 'Week 1',
      days: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        dayLabel: '',
        isRestDay: i === 0 || i === 6,
        exercises: [],
      }))
    }
  ]);
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(!!planId);
  
  // Use refs to avoid unstable function identities for the header
  const nameRef = useRef(name);
  const weeksRef = useRef(weeks);
  
  useEffect(() => {
    nameRef.current = name;
  }, [name]);
  
  useEffect(() => {
    weeksRef.current = weeks;
  }, [weeks]);

  // Load existing plan if planId is provided
  useEffect(() => {
    if (planId) {
      const loadPlan = async () => {
        try {
          const plan = await planService.getPlanById(planId);
          if (plan) {
            setName(plan.name);
            const stateWeeks: PlanWeekState[] = plan.weeks.map((w) => ({
              weekNumber: w.weekNumber,
              label: w.label || `Week ${w.weekNumber}`,
              days: Array.from({ length: 7 }, (_, i) => {
                const dbDay = w.days.find((d) => d.dayOfWeek === i);
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
              })
            }));
            setWeeks(stateWeeks);
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

  const addWeek = () => {
    setWeeks(prev => [
      ...prev,
      {
        weekNumber: prev.length + 1,
        label: `Week ${prev.length + 1}`,
        days: Array.from({ length: 7 }, (_, i) => ({
          dayOfWeek: i,
          dayLabel: '',
          isRestDay: i === 0 || i === 6,
          exercises: [],
        }))
      }
    ]);
    setCurrentWeekIndex(weeks.length);
  };

  const removeWeek = (index: number) => {
    if (weeks.length <= 1) return;
    setWeeks(prev => {
      const newWeeks = prev.filter((_, i) => i !== index);
      return newWeeks.map((w, i) => ({ ...w, weekNumber: i + 1 }));
    });
    if (currentWeekIndex >= index && currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const duplicateWeek = (index: number) => {
    setWeeks(prev => {
      const weekToCopy = prev[index];
      const newWeeks = [...prev];
      newWeeks.splice(index + 1, 0, {
        ...JSON.parse(JSON.stringify(weekToCopy)), // Deep copy
        weekNumber: index + 2,
        label: `${weekToCopy.label} (Copy)`
      });
      return newWeeks.map((w, i) => ({ ...w, weekNumber: i + 1 }));
    });
    setCurrentWeekIndex(index + 1);
  };

  const toggleRestDay = (dayIndex: number) => {
    setWeeks(prev => prev.map((week, wIdx) => 
      wIdx === currentWeekIndex 
        ? {
            ...week,
            days: week.days.map((day, dIdx) => 
              dIdx === dayIndex ? { ...day, isRestDay: !day.isRestDay } : day
            )
          }
        : week
    ));
  };

  const updateDayLabel = (dayIndex: number, label: string) => {
    setWeeks(prev => prev.map((week, wIdx) => 
      wIdx === currentWeekIndex 
        ? {
            ...week,
            days: week.days.map((day, dIdx) => 
              dIdx === dayIndex ? { ...day, dayLabel: label } : day
            )
          }
        : week
    ));
  };

  const addExerciseToDay = (dayIndex: number, exercise: Exercise) => {
    setWeeks(prev => prev.map((week, wIdx) => {
      if (wIdx === currentWeekIndex) {
        return {
          ...week,
          days: week.days.map((day, dIdx) => {
            if (dIdx === dayIndex) {
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
          })
        };
      }
      return week;
    }));
  };

  const removeExerciseFromDay = (dayIndex: number, exerciseId: number) => {
    setWeeks(prev => prev.map((week, wIdx) => 
      wIdx === currentWeekIndex 
        ? {
            ...week,
            days: week.days.map((day, dIdx) => 
              dIdx === dayIndex 
                ? { ...day, exercises: day.exercises.filter(ex => ex.exerciseId !== exerciseId) } 
                : day
            )
          }
        : week
    ));
  };

  const updateExerciseSetsReps = (dayIndex: number, exerciseId: number, sets: number, reps: number) => {
    setWeeks(prev => prev.map((week, wIdx) => 
      wIdx === currentWeekIndex 
        ? {
            ...week,
            days: week.days.map((day, dIdx) => 
              dIdx === dayIndex 
                ? {
                    ...day,
                    exercises: day.exercises.map(ex =>
                      ex.exerciseId === exerciseId ? { ...ex, sets, reps } : ex
                    )
                  }
                : day
            )
          }
        : week
    ));
  };

  const savePlan = useCallback(async () => {
    const currentName = nameRef.current;
    const currentWeeks = weeksRef.current;

    if (!currentName.trim()) {
      Alert.alert('Error', 'Please enter a plan name');
      return;
    }

    setIsSaving(true);
    try {
      const planData = {
        name: currentName,
        type: 'CUSTOM' as const,
        weeks: currentWeeks.map((week: PlanWeekState) => ({
          weekNumber: week.weekNumber,
          label: week.label,
          days: week.days.map((day: PlanDayState) => ({
            dayOfWeek: day.dayOfWeek,
            dayLabel: day.dayLabel,
            isRestDay: day.isRestDay,
            exercises: day.exercises.map((ex: ExerciseState) => ({
              exerciseId: ex.exerciseId,
              sets: ex.sets,
              reps: ex.reps,
              order: ex.order,
            })),
          })),
        })),
      };

      if (planId) {
        await planService.updatePlan(planId, planData);
      } else {
        await planService.createPlan(planData);
      }
      router.back();
    } catch (error) {
      console.error('Failed to save plan:', error);
      Alert.alert('Error', 'Failed to save plan. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [router, planId]);

  return {
    name,
    setName,
    weeks,
    currentWeekIndex,
    setCurrentWeekIndex,
    addWeek,
    removeWeek,
    duplicateWeek,
    days: weeks[currentWeekIndex]?.days || [],
    toggleRestDay,
    updateDayLabel,
    addExerciseToDay,
    removeExerciseFromDay,
    updateExerciseSetsReps,
    savePlan,
    isSaving,
    isLoading,
    exerciseSearch,
    searchResults,
    isSearching,
    selectedMuscleGroup,
    muscleGroups,
    handleSearchExercises,
    setFilterAndSearch
  };
}
