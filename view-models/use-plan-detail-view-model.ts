import { planService } from '@/services/plan-service';
import { useEffect, useState } from 'react';

export function usePlanDetailViewModel(id: number) {
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPlan() {
      setIsLoading(true);
      try {
        const data = await planService.getPlanById(id);
        setPlan(data);
      } catch (error) {
        console.error('Failed to load plan details:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      loadPlan();
    }
  }, [id]);

  return {
    plan,
    isLoading,
  };
}
