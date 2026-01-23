import { db } from '../db/client';

export const ExerciseService = {
  /**
   * Fetches all exercises from the database
   */
  async getAllExercises() {
    if (!db) return [];
    return await db.query.exercises.findMany();
  },

  /**
   * Search exercises by title
   */
  async searchExercises(query: string) {
    if (!db) return [];
    return await db.query.exercises.findMany({
      where: (exercises, { like }) => like(exercises.title, `%${query}%`),
    });
  }
};
