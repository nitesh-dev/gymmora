import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';



export const exercises = sqliteTable('exercises', {
    id: integer('id').primaryKey(),
    title: text('title').notNull(),
    url: text('url'),
    overview: text('overview'),
    gifUrl: text('gif_url'),
    musclesWorkedImg: text('muscles_worked_img'),
});

export const exerciseContent = sqliteTable('exercise_content', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
    contentType: text('content_type', { enum: ['step', 'benefit', 'tip', 'mistake'] }).notNull(),
    contentText: text('content_text').notNull(),
    orderIndex: integer('order_index').notNull(),
});

export const exerciseMusclesWorked = sqliteTable('exercise_muscles_worked', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    percentage: integer('percentage').notNull(),
});

export const exerciseMuscleGroups = sqliteTable('exercise_muscle_groups', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
});

export const exerciseEquipment = sqliteTable('exercise_equipment', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
});

export const exerciseVariations = sqliteTable('exercise_variations', {
    exerciseId: integer('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
    variationId: integer('variation_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.exerciseId, t.variationId] }),
}));

// RELATIONS

export const exercisesRelations = relations(exercises, ({ many }) => ({
    content: many(exerciseContent),
    musclesWorked: many(exerciseMusclesWorked),
    muscleGroups: many(exerciseMuscleGroups),
    equipment: many(exerciseEquipment),
    variations: many(exerciseVariations, { relationName: 'exercise_variations' }),
}));

export const exerciseContentRelations = relations(exerciseContent, ({ one }) => ({
    exercise: one(exercises, {
        fields: [exerciseContent.exerciseId],
        references: [exercises.id],
    }),
}));

export const exerciseMusclesWorkedRelations = relations(exerciseMusclesWorked, ({ one }) => ({
    exercise: one(exercises, {
        fields: [exerciseMusclesWorked.exerciseId],
        references: [exercises.id],
    }),
}));

export const exerciseMuscleGroupsRelations = relations(exerciseMuscleGroups, ({ one }) => ({
    exercise: one(exercises, {
        fields: [exerciseMuscleGroups.exerciseId],
        references: [exercises.id],
    }),
}));

export const exerciseEquipmentRelations = relations(exerciseEquipment, ({ one }) => ({
    exercise: one(exercises, {
        fields: [exerciseEquipment.exerciseId],
        references: [exercises.id],
    }),
}));

export const exerciseVariationsRelations = relations(exerciseVariations, ({ one }) => ({
    exercise: one(exercises, {
        fields: [exerciseVariations.exerciseId],
        references: [exercises.id],
        relationName: 'exercise_variations',
    }),
    variation: one(exercises, {
        fields: [exerciseVariations.variationId],
        references: [exercises.id],
        relationName: 'variation_exercises',
    }),
}));
