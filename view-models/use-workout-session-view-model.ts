import { PlanDayWithExercises, WorkoutSessionSet } from '@/db/types';
import { workoutService } from '@/services/workout-service';
import { useCallback, useEffect, useState } from 'react';

export function useWorkoutSessionViewModel(planDayId: number) {
  const [planDay, setPlanDay] = useState<PlanDayWithExercises | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Track logs for each exercise: map of exerciseId -> sets
  // Each set is { reps: number, weight: string, isCompleted: boolean }
  const [workoutData, setWorkoutData] = useState<Record<number, WorkoutSessionSet[]>>({});

  const loadWorkout = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await workoutService.getPlanDayById(planDayId);
      
      if (data) {
        setPlanDay(data);
        initializeWorkoutData(data.exercises);
      }
    } catch (error) {
      console.error('Failed to load workout session:', error);
    } finally {
      setIsLoading(false);
    }
  }, [planDayId]);

  const initializeWorkoutData = (exercises: PlanDayWithExercises['exercises']) => {
    const initialData: Record<number, WorkoutSessionSet[]> = {};
    exercises.forEach((ex) => {
      initialData[ex.exerciseId] = Array.from({ length: ex.sets }).map((_, i) => ({
        setIndex: i,
        reps: ex.reps.toString(),
        weight: '',
        isCompleted: false,
      }));
    });
    setWorkoutData(initialData);
  };

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (!isPaused && !isLoading) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPaused, isLoading]);

  const toggleSet = (exerciseId: number, setIndex: number) => {
    setWorkoutData(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) => 
        i === setIndex ? { ...set, isCompleted: !set.isCompleted } : set
      )
    }));
  };

  const updateSet = (exerciseId: number, setIndex: number, fields: Partial<WorkoutSessionSet>) => {
    setWorkoutData(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) => 
        i === setIndex ? { ...set, ...fields } : set
      )
    }));
  };

  const finishWorkout = async () => {
    try {
      const setsToSave: { exerciseId: number; reps: number; weight: string; setIndex: number }[] = [];
      Object.entries(workoutData).forEach(([exerciseId, sets]) => {
        sets.forEach((set) => {
          if (set.isCompleted) {
            setsToSave.push({
              exerciseId: parseInt(exerciseId),
              reps: parseInt(set.reps) || 0,
              weight: set.weight,
              setIndex: set.setIndex,
            });
          }
        });
      });

      if (setsToSave.length === 0) {
        alert('Please complete at least one set');
        return false;
      }

      await workoutService.saveWorkoutLog({
        planDayId,
        duration,
        sets: setsToSave,
      });
      return true;
    } catch (error) {
      console.error('Failed to finish workout:', error);
      return false;
    }
  };

  return {
    planDay,
    isLoading,
    duration,
    isPaused,
    setIsPaused,
    workoutData,
    toggleSet,
    updateSet,
    finishWorkout,
  };
}
