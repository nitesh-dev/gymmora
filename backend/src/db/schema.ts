import { boolean, integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['USER', 'ADMIN']);
export const planTypeEnum = pgEnum('plan_type', ['SYSTEM', 'CUSTOM']);
export const planVisibilityEnum = pgEnum('plan_visibility', ['PUBLIC', 'PRIVATE', 'SYSTEM']);
export const planStatusEnum = pgEnum('plan_status', ['active', 'inactive']);
export const workoutStatusEnum = pgEnum('workout_status', ['COMPLETED', 'ABANDONED']);
export const contentTypeEnum = pgEnum('content_type', ['step', 'benefit', 'tip', 'mistake']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').default('USER').notNull(),
  lastSyncAt: timestamp('last_sync_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

export const exercises = pgTable('exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  url: text('url'),
  overview: text('overview'),
  gifUrl: text('gif_url'),
  musclesWorkedImg: text('muscles_worked_img'),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const exerciseContent = pgTable('exercise_content', {
  id: uuid('id').defaultRandom().primaryKey(),
  exerciseId: uuid('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  contentType: contentTypeEnum('content_type').notNull(),
  contentText: text('content_text').notNull(),
  orderIndex: integer('order_index').notNull(),
});

export const workoutPlans = pgTable('workout_plans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  type: planTypeEnum('type').notNull(),
  visibility: planVisibilityEnum('visibility').default('PRIVATE').notNull(),
  status: planStatusEnum('status').default('inactive').notNull(),
  currentWeek: integer('current_week').default(1).notNull(),
  forkedFromId: uuid('forked_from_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

export const planWeeks = pgTable('plan_weeks', {
  id: uuid('id').defaultRandom().primaryKey(),
  planId: uuid('plan_id').notNull().references(() => workoutPlans.id, { onDelete: 'cascade' }),
  weekNumber: integer('week_number').notNull(),
  label: text('label'),
});

export const planDays = pgTable('plan_days', {
  id: uuid('id').defaultRandom().primaryKey(),
  weekId: uuid('week_id').notNull().references(() => planWeeks.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(),
  dayLabel: text('day_label'),
  isRestDay: boolean('is_rest_day').default(false).notNull(),
});

export const planDayExercises = pgTable('plan_day_exercises', {
  id: uuid('id').defaultRandom().primaryKey(),
  planDayId: uuid('plan_day_id').notNull().references(() => planDays.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  sets: integer('sets').notNull(),
  reps: integer('reps').notNull(),
  exerciseOrder: integer('exercise_order').notNull(),
});

export const workoutLogs = pgTable('workout_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planDayId: uuid('plan_day_id').references(() => planDays.id, { onDelete: 'set null' }),
  date: timestamp('date').notNull(),
  duration: integer('duration'),
  status: workoutStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
});

export const setLogs = pgTable('set_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  workoutLogId: uuid('workout_log_id').notNull().references(() => workoutLogs.id, { onDelete: 'cascade' }),
  exerciseId: uuid('exercise_id').notNull().references(() => exercises.id, { onDelete: 'cascade' }),
  repsDone: integer('reps_done').notNull(),
  weight: text('weight').notNull(),
  setIndex: integer('set_index').notNull(),
});
