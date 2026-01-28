import { api } from './api';

export interface Plan {
  id: string;
  name: string;
  type: 'SYSTEM' | 'CUSTOM';
  visibility: 'PUBLIC' | 'PRIVATE' | 'SYSTEM';
  status: 'active' | 'inactive';
  currentWeek: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlanDetail extends Plan {
    weeks: PlanWeek[];
}

export interface PlanWeek {
    id: string;
    weekNumber: number;
    label: string;
    days: PlanDay[];
}

export interface PlanDay {
    id: string;
    dayOfWeek: number;
    dayLabel: string;
    isRestDay: boolean;
    exercises: PlanDayExercise[];
}

export interface PlanDayExercise {
    id: string;
    exerciseId: string;
    sets: number;
    reps: number;
    exerciseOrder: number;
}

export const planService = {
  getPlans: async () => {
    return await api.get<Plan[]>('/plans');
  },
  getPlanById: async (id: string) => {
    return await api.get<PlanDetail>(`/plans/${id}`);
  },
  createPlan: async (data: any) => {
    return await api.post<PlanDetail>('/plans', data);
  },
  updatePlan: async (id: string, data: any) => {
    return await api.put<PlanDetail>(`/plans/${id}`, data);
  },
  deletePlan: async (id: string) => {
    await api.delete(`/plans/${id}`);
  },
};
