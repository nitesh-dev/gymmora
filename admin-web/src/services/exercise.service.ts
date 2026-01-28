import type { Exercise, ExerciseWithContent } from '../models/exercise';
import { api } from './api';

class ExerciseService {
  async getAllExercises() {
    return api.get<Exercise[]>('/exercises');
  }

  async getExerciseById(id: string) {
    return api.get<ExerciseWithContent>(`/exercises/${id}`);
  }

  async createExercise(data: any) {
    return api.post<Exercise>('/exercises', data);
  }

  async updateExercise(id: string, data: any) {
    return api.put<Exercise>(`/exercises/${id}`, data);
  }

  async deleteExercise(id: string) {
    return api.delete(`/exercises/${id}`);
  }

  async importExercises(data: any[]) {
    return api.post<{ count: number }>('/exercises/import', data);
  }
}

export const exerciseService = new ExerciseService();
