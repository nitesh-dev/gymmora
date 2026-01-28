import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { planService } from '../services/plan.service';

export function usePlansViewModel() {
  const queryClient = useQueryClient();

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ['plans'],
    queryFn: () => planService.getPlans(),
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id: string) => planService.deletePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  const createPlanMutation = useMutation({
    mutationFn: (data: any) => planService.createPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
    },
  });

  return {
    plans,
    isLoading,
    error,
    deletePlan: deletePlanMutation.mutateAsync,
    isDeleting: deletePlanMutation.isPending,
    createPlan: createPlanMutation.mutateAsync,
    isCreating: createPlanMutation.isPending,
  };
}
