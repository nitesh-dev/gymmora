import { planService } from '@/services/plan-service';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

export function usePlansViewModel() {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadPlans = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await planService.getPlans();
      console.log('Fetched plans count:', data.length);
      setPlans(data);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPlans(plans.length > 0);
    }, [loadPlans, plans.length])
  );

  const deletePlan = async (id: number) => {
    try {
      await planService.deletePlan(id);
      await loadPlans();
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const importPlan = async (jsonContent: string) => {
    try {
      await planService.validateAndImportPlan(jsonContent);
      await loadPlans();
    } catch (error) {
      console.error('Failed to import plan:', error);
      throw error;
    }
  };

  const exportPlan = async (id: number) => {
    return await planService.exportPlan(id);
  };

  const getTemplate = () => {
    return planService.getPlanTemplate();
  };

  return {
    plans,
    isLoading,
    refreshPlans: loadPlans,
    deletePlan,
    importPlan,
    exportPlan,
    getTemplate,
  };
}