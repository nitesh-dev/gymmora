import { eq } from 'drizzle-orm';
import { db } from '../db/client';
import { exerciseEquipment, exerciseMuscleGroups, exercises } from '../db/schema';

export const ExerciseService = {
  /**
   * Fetches exercises with optional filtering
   */
  async getExercises(filters?: { search?: string; muscleGroup?: string; equipment?: string }) {
    if (!db) return [];

    return await db.query.exercises.findMany({
      where: (table, { and, like }) => {
        const conditions = [];
        if (filters?.search) {
          conditions.push(like(table.title, `%${filters.search}%`));
        }
        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: {
        muscleGroups: true,
        equipment: true,
      },
    }).then(results => {
      // Manual filtering for many-to-many relations if needed OR use subqueries
      // For simplicity in SQLite, we can filter in JS if the list isn't massive, 
      // or use `exists` in `where` clause.
      let filtered = results;
      if (filters?.muscleGroup) {
        filtered = filtered.filter(ex => 
          ex.muscleGroups.some(mg => mg.name === filters.muscleGroup)
        );
      }
      if (filters?.equipment) {
        filtered = filtered.filter(ex => 
          ex.equipment.some(eq => eq.name === filters.equipment)
        );
      }
      return filtered;
    });
  },

  /**
   * Fetches full details for a single exercise
   */
  async getExerciseById(id: number) {
    if (!db) return null;
    return await db.query.exercises.findFirst({
      where: eq(exercises.id, id),
      with: {
        content: true,
        musclesWorked: true,
        muscleGroups: true,
        equipment: true,
        variations: {
          with: {
            variation: true,
          }
        }
      },
    });
  },

  /**
   * Get unique muscle groups for filter
   */
  async getUniqueMuscleGroups() {
    if (!db) return [];
    const results = await db.selectDistinct({ name: exerciseMuscleGroups.name }).from(exerciseMuscleGroups);
    return results.map(r => r.name);
  },

  /**
   * Get unique equipment for filter
   */
  async getUniqueEquipment() {
    if (!db) return [];
    const results = await db.selectDistinct({ name: exerciseEquipment.name }).from(exerciseEquipment);
    return results.map(r => r.name);
  },

  /**
   * Add a mock exercise for testing
   */
  async addMockExercise() {
    if (!db) return;
    const mockId = Math.floor(Math.random() * 1000000);
    await db.insert(exercises).values({
      id: mockId,
      title: `Test Exercise ${mockId}`,
      overview: 'This is a test exercise added to verify DB functionality.',
      gifUrl: 'https://via.placeholder.com/150',
    });
  }
};
