import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { exerciseContent, exerciseEquipment, exerciseMuscleGroups, exerciseMusclesWorked, exercises, exerciseVariations } from '../db/schema';

export class ExerciseRepository {
    async findAll() {
        return await db.select().from(exercises).where(eq(exercises.isDeleted, false));
    }

    async findById(id: string) {
        const [exercise] = await db.select().from(exercises).where(and(eq(exercises.id, id), eq(exercises.isDeleted, false)));
        return exercise;
    }

    async getExerciseWithContent(id: string) {
        const exercise = await this.findById(id);
        if (!exercise) return null;

        const content = await db.select().from(exerciseContent).where(eq(exerciseContent.exerciseId, id));
        const musclesWorked = await db.select().from(exerciseMusclesWorked).where(eq(exerciseMusclesWorked.exerciseId, id));
        const muscleGroups = await db.select().from(exerciseMuscleGroups).where(eq(exerciseMuscleGroups.exerciseId, id));
        const equipment = await db.select().from(exerciseEquipment).where(eq(exerciseEquipment.exerciseId, id));
        const variations = await db.select().from(exerciseVariations).where(eq(exerciseVariations.exerciseId, id));

        return { ...exercise, content, musclesWorked, muscleGroups, equipment, variations };
    }

    async create(data: typeof exercises.$inferInsert) {
        const [exercise] = await db.insert(exercises).values(data).returning();
        return exercise;
    }

    async batchCreate(data: { 
        exercise: typeof exercises.$inferInsert, 
        content: typeof exerciseContent.$inferInsert[],
        musclesWorked?: typeof exerciseMusclesWorked.$inferInsert[],
        muscleGroups?: typeof exerciseMuscleGroups.$inferInsert[],
        equipment?: typeof exerciseEquipment.$inferInsert[],
    }[]) {
        return await db.transaction(async (tx) => {
            const results = [];
            for (const item of data) {
                const [exercise] = await tx.insert(exercises).values(item.exercise).returning();
                
                if (item.content.length > 0) {
                    await tx.insert(exerciseContent).values(
                        item.content.map(c => ({ ...c, exerciseId: exercise.id }))
                    );
                }

                if (item.musclesWorked && item.musclesWorked.length > 0) {
                    await tx.insert(exerciseMusclesWorked).values(
                        item.musclesWorked.map(m => ({ ...m, exerciseId: exercise.id }))
                    );
                }

                if (item.muscleGroups && item.muscleGroups.length > 0) {
                    await tx.insert(exerciseMuscleGroups).values(
                        item.muscleGroups.map(g => ({ ...g, exerciseId: exercise.id }))
                    );
                }

                if (item.equipment && item.equipment.length > 0) {
                    await tx.insert(exerciseEquipment).values(
                        item.equipment.map(e => ({ ...e, exerciseId: exercise.id }))
                    );
                }

                results.push(exercise);
            }
            return results;
        });
    }

    async createContent(data: typeof exerciseContent.$inferInsert[]) {
        return await db.insert(exerciseContent).values(data).returning();
    }

    async update(id: string, data: Partial<typeof exercises.$inferInsert>) {
        const [exercise] = await db.update(exercises)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(exercises.id, id))
            .returning();
        return exercise;
    }

    async delete(id: string) {
        const [exercise] = await db.update(exercises)
            .set({ isDeleted: true, updatedAt: new Date() })
            .where(eq(exercises.id, id))
            .returning();
        return exercise;
    }
}

export const exerciseRepository = new ExerciseRepository();
