import { getDb } from '@/db/client';
import { exerciseEquipment, exerciseMuscleGroups, exercises } from '@/db/schema';
import { ExerciseWithMuscleGroupsAndEquipment, ExerciseWithRelations } from '@/db/types';
import { eq } from 'drizzle-orm';

export const ExerciseService = {
  /**
   * Fetches exercises with optional filtering
   */
  async getExercises(filters?: { search?: string; muscleGroup?: string; equipment?: string }): Promise<ExerciseWithMuscleGroupsAndEquipment[]> {
    try {
      const db = await getDb();
      if (!db) return [];

      const results = await db.query.exercises.findMany({
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
      });

      let filtered = results;
      if (filters?.muscleGroup) {
        filtered = filtered.filter((ex) => 
          ex.muscleGroups.some((mg) => mg.name === filters.muscleGroup)
        );
      }
      if (filters?.equipment) {
        filtered = filtered.filter((ex) => 
          ex.equipment.some((eq) => eq.name === filters.equipment)
        );
      }
      return filtered;
    } catch (error) {
      console.error('getExercises failed:', error);
      return [];
    }
  },

  /**
   * Fetches full details for a single exercise
   */
  async getExerciseById(id: number): Promise<ExerciseWithRelations | null> {
    const db = await getDb();
    if (!db) return null;
    const result = await db.query.exercises.findFirst({
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
    return (result || null) as ExerciseWithRelations | null;
  },

  /**
   * Get unique muscle groups for filter
   */
  async getUniqueMuscleGroups() {
    const db = await getDb();
    if (!db) return [];
    const results = await db.selectDistinct({ name: exerciseMuscleGroups.name }).from(exerciseMuscleGroups);
    return results.map((r: { name: string }) => r.name);
  },

  /**
   * Get unique equipment for filter
   */
  async getUniqueEquipment() {
    const db = await getDb();
    if (!db) return [];
    const results = await db.selectDistinct({ name: exerciseEquipment.name }).from(exerciseEquipment);
    return results.map((r: { name: string }) => r.name);
  },

  /**
   * Add a mock exercise for testing
   */
  async addMockExercise() {
    const db = await getDb();
    if (!db) return;
    const mockId = Math.floor(Math.random() * 1000000);
    await db.insert(exercises).values({
      id: mockId,
      title: `Test Exercise ${mockId}`,
      overview: 'This is a test exercise added to verify DB functionality.',
      gifUrl: 'https://via.placeholder.com/150',
    });
  },

  /**
   * Fetches all exercises with only ID and title for export/reference
   */
  async getAllExercisesMinimal() {
    try {
      const db = await getDb();
      if (!db) return [];

      const results = await db.query.exercises.findMany({
        columns: {
          id: true,
          title: true,
        },
      });

      return results.map(ex => ({
        id: ex.id,
        name: ex.title,
      }));
    } catch (error) {
      console.error('getAllExercisesMinimal failed:', error);
      return [];
    }
  },
};
