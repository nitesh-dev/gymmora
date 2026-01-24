import { workoutService } from '@/services/workout-service';
import { useEffect, useState } from 'react';

export function useWorkoutLogDetailViewModel(id: number) {
  const [log, setLog] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const data = await workoutService.getWorkoutLogById(id);
        
        if (data) {
          // Group sets by exercise
          const groupedSets: Record<number, any> = {};
          data.sets.forEach((set: any) => {
            if (!groupedSets[set.exerciseId]) {
              groupedSets[set.exerciseId] = {
                exercise: set.exercise,
                sets: [],
              };
            }
            groupedSets[set.exerciseId].sets.push(set);
          });
          
          // Sort sets for each exercise by setIndex
          Object.values(groupedSets).forEach((group: any) => {
            group.sets.sort((a: any, b: any) => a.setIndex - b.setIndex);
          });

          setLog({
            ...data,
            groupedExercises: Object.values(groupedSets),
            totalVolume: data.sets.reduce((acc: number, set: any) => acc + (parseFloat(set.weight) || 0) * set.repsDone, 0),
          });
        }
      } catch (error) {
        console.error('Failed to load workout log:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id]);

  return {
    log,
    isLoading,
  };
}
