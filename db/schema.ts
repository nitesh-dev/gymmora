import { relations } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
});

export const activities = sqliteTable('activities', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  type: text('type').notNull(),
  timestamp: integer('timestamp', { mode: 'timestamp' }).notNull(),
});

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
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  contentType: text('content_type', {
    enum: ['step', 'benefit', 'tip', 'mistake'],
  }).notNull(),
  contentText: text('content_text').notNull(),
  orderIndex: integer('order_index').notNull(),
});

export const exerciseMusclesWorked = sqliteTable('exercise_muscles_worked', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  percentage: integer('percentage').notNull(),
});

export const exerciseMuscleGroups = sqliteTable('exercise_muscle_groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
});

export const exerciseEquipment = sqliteTable('exercise_equipment', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
});

export const exerciseVariations = sqliteTable(
  'exercise_variations',
  {
    exerciseId: integer('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    variationId: integer('variation_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.exerciseId, t.variationId] }),
  })
);

export const workoutPlans = sqliteTable('workout_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['SYSTEM', 'CUSTOM'] }).notNull(),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('inactive'),
  currentWeek: integer('current_week').notNull().default(1),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const planWeeks = sqliteTable('plan_weeks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: integer('plan_id')
    .notNull()
    .references(() => workoutPlans.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  label: text('label'),
});

export const planDays = sqliteTable('plan_days', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  weekId: integer('week_id')
    .notNull()
    .references(() => planWeeks.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0=Sun ... 6=Sat
  dayLabel: text('day_label'), // Push / Pull / Legs etc.
  isRestDay: integer('is_rest_day', { mode: 'boolean' }).notNull().default(false),
});

export const planDayExercises = sqliteTable('plan_day_exercises', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planDayId: integer('plan_day_id')
    .notNull()
    .references(() => planDays.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  sets: integer('sets').notNull(),
  reps: integer('reps').notNull(),
  exerciseOrder: integer('exercise_order').notNull(),
});

export const workoutLogs = sqliteTable('workout_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planDayId: integer('plan_day_id').references(() => planDays.id, {
    onDelete: 'set null',
  }),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  duration: integer('duration'), // total time in seconds
  status: text('status', { enum: ['COMPLETED', 'ABANDONED'] }).notNull(),
});

export const setLogs = sqliteTable('set_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  workoutLogId: integer('workout_log_id')
    .notNull()
    .references(() => workoutLogs.id, { onDelete: 'cascade' }),
  exerciseId: integer('exercise_id')
    .notNull()
    .references(() => exercises.id, { onDelete: 'cascade' }),
  repsDone: integer('reps_done').notNull(),
  weight: text('weight').notNull(), // text to support units or decimals
  setIndex: integer('set_index').notNull(),
});

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

export const exerciseMusclesWorkedRelations = relations(
  exerciseMusclesWorked,
  ({ one }) => ({
    exercise: one(exercises, {
      fields: [exerciseMusclesWorked.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const exerciseMuscleGroupsRelations = relations(
  exerciseMuscleGroups,
  ({ one }) => ({
    exercise: one(exercises, {
      fields: [exerciseMuscleGroups.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const exerciseEquipmentRelations = relations(
  exerciseEquipment,
  ({ one }) => ({
    exercise: one(exercises, {
      fields: [exerciseEquipment.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const exerciseVariationsRelations = relations(
  exerciseVariations,
  ({ one }) => ({
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
  })
);

export const workoutPlansRelations = relations(workoutPlans, ({ many }) => ({
  weeks: many(planWeeks),
}));

export const planWeeksRelations = relations(planWeeks, ({ one, many }) => ({
  plan: one(workoutPlans, {
    fields: [planWeeks.planId],
    references: [workoutPlans.id],
  }),
  days: many(planDays),
}));

export const planDaysRelations = relations(planDays, ({ one, many }) => ({
  week: one(planWeeks, {
    fields: [planDays.weekId],
    references: [planWeeks.id],
  }),
  exercises: many(planDayExercises),
  logs: many(workoutLogs),
}));

export const planDayExercisesRelations = relations(
  planDayExercises,
  ({ one }) => ({
    planDay: one(planDays, {
      fields: [planDayExercises.planDayId],
      references: [planDays.id],
    }),
    exercise: one(exercises, {
      fields: [planDayExercises.exerciseId],
      references: [exercises.id],
    }),
  })
);

export const workoutLogsRelations = relations(workoutLogs, ({ one, many }) => ({
  planDay: one(planDays, {
    fields: [workoutLogs.planDayId],
    references: [planDays.id],
  }),
  sets: many(setLogs),
}));

export const setLogsRelations = relations(setLogs, ({ one }) => ({
  workoutLog: one(workoutLogs, {
    fields: [setLogs.workoutLogId],
    references: [workoutLogs.id],
  }),
  exercise: one(exercises, {
    fields: [setLogs.exerciseId],
    references: [exercises.id],
  }),
}));
