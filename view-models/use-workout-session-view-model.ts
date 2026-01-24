import { workoutService } from '@/services/workout-service';
import { useCallback, useEffect, useState } from 'react';

export function useWorkoutSessionViewModel(planDayId: number) {
  const [planDay, setPlanDay] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Track logs for each exercise: map of exerciseId -> sets
  // Each set is { reps: number, weight: string, isCompleted: boolean }
  const [workoutData, setWorkoutData] = useState<Record<number, any[]>>({});

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

  const initializeWorkoutData = (exercises: any[]) => {
    const initialData: Record<number, any[]> = {};
    exercises.forEach((ex: any) => {
      initialData[ex.exerciseId] = Array.from({ length: ex.sets }).map((_, i) => ({
        setIndex: i,
        reps: ex.reps,
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
    let interval: any;
    if (!isPaused && !isLoading) {
      interval = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isLoading]);

  const toggleSet = (exerciseId: number, setIndex: number) => {
    setWorkoutData(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) => 
        i === setIndex ? { ...set, isCompleted: !set.isCompleted } : set
      )
    }));
  };

  const updateSet = (exerciseId: number, setIndex: number, fields: any) => {
    setWorkoutData(prev => ({
      ...prev,
      [exerciseId]: prev[exerciseId].map((set, i) => 
        i === setIndex ? { ...set, ...fields } : set
      )
    }));
  };

  const finishWorkout = async () => {
    try {
      const setsToSave: any[] = [];
      Object.entries(workoutData).forEach(([exerciseId, sets]: [string, any]) => {
        sets.forEach((set: any) => {
          if (set.isCompleted) {
            setsToSave.push({
              exerciseId: parseInt(exerciseId),
              reps: set.reps,
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
