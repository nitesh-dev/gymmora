import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { planService, type PlanDetail } from '../services/plan.service';

export function usePlanStudioViewModel(id?: string) {
  const queryClient = useQueryClient();
  const isNew = id === 'new' || !id;

  const { data: plan, isLoading } = useQuery({
    queryKey: ['plan', id],
    queryFn: () => (id && !isNew ? planService.getPlanById(id) : null),
    enabled: !!id && !isNew,
  });

  const [localPlan, setLocalPlan] = useState<Partial<PlanDetail>>({
    name: '',
    type: 'SYSTEM',
    visibility: 'PUBLIC',
    status: 'active',
    weeks: []
  });

  useEffect(() => {
    if (plan) {
      setLocalPlan(plan);
    }
  }, [plan]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => 
      isNew ? planService.createPlan(data) : planService.updatePlan(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plans'] });
      queryClient.invalidateQueries({ queryKey: ['plan', id] });
    },
  });

  const updateBasicInfo = (field: string, value: any) => {
    setLocalPlan(prev => ({ ...prev, [field]: value }));
  };

  const addWeek = () => {
    setLocalPlan(prev => ({
      ...prev,
      weeks: [
        ...(prev.weeks || []),
        {
          id: crypto.randomUUID(),
          weekNumber: (prev.weeks?.length || 0) + 1,
          label: `Week ${(prev.weeks?.length || 0) + 1}`,
          days: []
        }
      ]
    }));
  };

  const addDay = (weekId: string) => {
    setLocalPlan(prev => ({
      ...prev,
      weeks: prev.weeks?.map(w => w.id === weekId ? {
        ...w,
        days: [
          ...w.days,
          {
            id: crypto.randomUUID(),
            dayOfWeek: w.days.length + 1,
            dayLabel: `Day ${w.days.length + 1}`,
            isRestDay: false,
            exercises: []
          }
        ]
      } : w)
    }));
  };

  const addExercise = (weekId: string, dayId: string, exerciseId: string) => {
    setLocalPlan(prev => ({
        ...prev,
        weeks: prev.weeks?.map(w => w.id === weekId ? {
          ...w,
          days: w.days.map(d => d.id === dayId ? {
            ...d,
            exercises: [
                ...d.exercises,
                {
                    id: crypto.randomUUID(),
                    exerciseId,
                    sets: 3,
                    reps: 10,
                    exerciseOrder: d.exercises.length
                }
            ]
          } : d)
        } : w)
      }));
  };

  const removeExercise = (weekId: string, dayId: string, exerciseId: string) => {
    setLocalPlan(prev => ({
        ...prev,
        weeks: prev.weeks?.map(w => w.id === weekId ? {
          ...w,
          days: w.days.map(d => d.id === dayId ? {
            ...d,
            exercises: d.exercises.filter(e => e.id !== exerciseId)
          } : d)
        } : w)
      }));
  };

  const updateExercise = (weekId: string, dayId: string, exerciseId: string, data: any) => {
    setLocalPlan(prev => ({
        ...prev,
        weeks: prev.weeks?.map(w => w.id === weekId ? {
          ...w,
          days: w.days.map(d => d.id === dayId ? {
            ...d,
            exercises: d.exercises.map(e => e.id === exerciseId ? { ...e, ...data } : e)
          } : d)
        } : w)
      }));
  }

  const save = async () => {
    const payload = {
        name: localPlan.name,
        type: localPlan.type,
        visibility: localPlan.visibility,
        status: localPlan.status,
        structure: {
            weeks: localPlan.weeks?.map(w => ({
                weekNumber: w.weekNumber,
                label: w.label,
                days: w.days.map(d => ({
                    dayOfWeek: d.dayOfWeek,
                    dayLabel: d.dayLabel,
                    isRestDay: d.isRestDay,
                    exercises: d.exercises.map(e => ({
                        exerciseId: e.exerciseId,
                        sets: e.sets,
                        reps: e.reps
                    }))
                }))
            }))
        }
    };
    return await saveMutation.mutateAsync(payload);
  };

  return {
    plan: localPlan,
    isLoading,
    isSaving: saveMutation.isPending,
    updateBasicInfo,
    addWeek,
    addDay,
    addExercise,
    updateExercise,
    removeExercise,
    save
  };
}
