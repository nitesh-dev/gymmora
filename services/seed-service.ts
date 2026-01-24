import { sql } from 'drizzle-orm';
import { ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import results from '../assets/results.json';
import * as schema from '../db/schema';

interface SeedExercise {
  id: number;
  title: string;
  url: string;
  overview: string | null;
  gifUrl: string | null;
  howToPerform: string[] | null;
  tips: string[] | null;
  benefits: string[] | null;
  commonMistakes: string[] | null;
  musclesWorked: {
    img: string;
    items: { name: string; percentage: string }[];
  } | null;
  muscleGroups: string[] | null;
  equipment: string[] | null;
  variations: { title: string; url: string }[] | null;
}

export class SeedService {
  static async seedIfNeeded(db: ExpoSQLiteDatabase<typeof schema>) {
    try {
      // 1. Check if we already have exercises
      const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.exercises);
      const count = countResult[0]?.count ?? 0;

      if (count > 0) {
        console.log('✅ Database already seeded. Skipping...');
        return;
      }

      console.log('🌱 Starting database seed...');
      
      // We process in a transaction to ensure integrity
      await db.transaction(async (tx) => {
        const exercisesToInsert: (typeof schema.exercises.$inferInsert)[] = [];
        const contentsToInsert: (typeof schema.exerciseContent.$inferInsert)[] = [];
        const musclesWorkedToInsert: (typeof schema.exerciseMusclesWorked.$inferInsert)[] = [];
        const muscleGroupsToInsert: (typeof schema.exerciseMuscleGroups.$inferInsert)[] = [];
        const equipmentToInsert: (typeof schema.exerciseEquipment.$inferInsert)[] = [];
        const urlToIdMap = new Map<string, number>();

        // Pre-process Data
        for (const item of results as unknown as SeedExercise[]) {
          urlToIdMap.set(item.url, item.id);

          exercisesToInsert.push({
            id: item.id,
            title: item.title,
            url: item.url,
            overview: item.overview,
            gifUrl: item.gifUrl,
            musclesWorkedImg: item.musclesWorked?.img || null,
          });

          // Content Mapping
          if (Array.isArray(item.howToPerform)) {
            item.howToPerform.forEach((text: string, index: number) => {
              contentsToInsert.push({
                exerciseId: item.id,
                contentType: 'step',
                contentText: text,
                orderIndex: index,
              });
            });
          }

          if (Array.isArray(item.tips)) {
            item.tips.forEach((text: string, index: number) => {
              contentsToInsert.push({
                exerciseId: item.id,
                contentType: 'tip',
                contentText: text,
                orderIndex: index,
              });
            });
          }

          if (Array.isArray(item.benefits)) {
            item.benefits.forEach((text: string, index: number) => {
              contentsToInsert.push({
                exerciseId: item.id,
                contentType: 'benefit',
                contentText: text,
                orderIndex: index,
              });
            });
          }

          if (Array.isArray(item.commonMistakes)) {
            item.commonMistakes.forEach((text: string, index: number) => {
              contentsToInsert.push({
                exerciseId: item.id,
                contentType: 'mistake',
                contentText: text,
                orderIndex: index,
              });
            });
          }

          // Muscles & Equipment
          if (item.musclesWorked?.items) {
            item.musclesWorked.items.forEach((muscle) => {
              musclesWorkedToInsert.push({
                exerciseId: item.id,
                name: muscle.name,
                percentage: parseInt(muscle.percentage, 10) || 0,
              });
            });
          }

          if (item.muscleGroups) {
            item.muscleGroups.forEach((group: string) => {
              muscleGroupsToInsert.push({ exerciseId: item.id, name: group });
            });
          }

          if (item.equipment) {
            item.equipment.forEach((equip) => {
              equipmentToInsert.push({ exerciseId: item.id, name: equip });
            });
          }
        }

        // Inserting in batches (SQLite limits apply)
        const batchSize = 50;

        console.log(`Inserting ${exercisesToInsert.length} exercises...`);
        for (let i = 0; i < exercisesToInsert.length; i += batchSize) {
          await tx.insert(schema.exercises).values(exercisesToInsert.slice(i, i + batchSize)).onConflictDoNothing();
        }

        console.log('Inserting metadata...');
        for (let i = 0; i < contentsToInsert.length; i += batchSize) {
          await tx.insert(schema.exerciseContent).values(contentsToInsert.slice(i, i + batchSize));
        }
        for (let i = 0; i < musclesWorkedToInsert.length; i += batchSize) {
          await tx.insert(schema.exerciseMusclesWorked).values(musclesWorkedToInsert.slice(i, i + batchSize));
        }
        for (let i = 0; i < muscleGroupsToInsert.length; i += batchSize) {
          await tx.insert(schema.exerciseMuscleGroups).values(muscleGroupsToInsert.slice(i, i + batchSize));
        }
        for (let i = 0; i < equipmentToInsert.length; i += batchSize) {
          await tx.insert(schema.exerciseEquipment).values(equipmentToInsert.slice(i, i + batchSize));
        }

        // Linking variations
        console.log('Linking variations...');
        const variationsToInsert: (typeof schema.exerciseVariations.$inferInsert)[] = [];
        for (const item of results as unknown as SeedExercise[]) {
          if (Array.isArray(item.variations)) {
            for (const v of item.variations) {
              const variationId = urlToIdMap.get(v.url);
              if (variationId) {
                variationsToInsert.push({
                  exerciseId: item.id,
                  variationId: variationId,
                });
              }
            }
          }
        }

        for (let i = 0; i < variationsToInsert.length; i += batchSize) {
          await tx.insert(schema.exerciseVariations).values(variationsToInsert.slice(i, i + batchSize)).onConflictDoNothing();
        }

        console.log('✅ Database seed completed successfully!');
      });
    } catch (error) {
      console.error('❌ Failed to seed database:', error);
    }
  }
}
