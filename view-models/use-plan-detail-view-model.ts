import { planService } from '@/services/plan-service';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function usePlanDetailViewModel(id: number) {
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlan = useCallback(async (silent = false) => {
    if (!id) return;
    if (!silent) setIsLoading(true);
    try {
      const data = await planService.getPlanById(id);
      setPlan(data);
    } catch (error) {
      console.error('Failed to load plan details:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadPlan(!!plan); // Use silent load if we already have plan data
    }, [loadPlan, !!plan])
  );

  return {
    plan,
    isLoading,
    refresh: () => loadPlan(false)
  };
}
