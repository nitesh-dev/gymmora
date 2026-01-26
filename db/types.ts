import { exerciseContent, exerciseEquipment, exerciseMuscleGroups, exerciseMusclesWorked, exercises, exerciseVariations, planDayExercises, planDays, planWeeks, setLogs, workoutLogs, workoutPlans } from './schema';

export type Exercise = typeof exercises.$inferSelect;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;
export type PlanWeek = typeof planWeeks.$inferSelect;
export type PlanDay = typeof planDays.$inferSelect;
export type PlanDayExercise = typeof planDayExercises.$inferSelect;
export type WorkoutLog = typeof workoutLogs.$inferSelect;
export type SetLog = typeof setLogs.$inferSelect;
export type ExerciseMuscleGroup = typeof exerciseMuscleGroups.$inferSelect;
export type ExerciseEquipment = typeof exerciseEquipment.$inferSelect;
export type ExerciseContent = typeof exerciseContent.$inferSelect;
export type ExerciseMusclesWorked = typeof exerciseMusclesWorked.$inferSelect;
export type ExerciseVariation = typeof exerciseVariations.$inferSelect;

export type PlanDayWithExercises = PlanDay & {
  exercises: (PlanDayExercise & {
    exercise: Exercise;
  })[];
  week: PlanWeek & {
    plan: WorkoutPlan;
  };
};

export type PlanWeekWithDays = PlanWeek & {
  days: (PlanDay & {
    exercises: (PlanDayExercise & {
      exercise: Exercise;
    })[];
  })[];
};

export type WorkoutPlanWithWeeks = WorkoutPlan & {
  weeks: PlanWeekWithDays[];
};

// Keeping this for backward compatibility or simple usage if needed, 
// but it should probably be replaced by WorkoutPlanWithWeeks
export type WorkoutPlanWithDays = WorkoutPlan & {
  weeks: PlanWeekWithDays[];
};

export type WorkoutLogWithRelations = WorkoutLog & {
  planDay: (PlanDay & {
    week: PlanWeek & {
      plan: WorkoutPlan;
    };
  }) | null;
  sets: (SetLog & {
    exercise: Exercise;
  })[];
};

export type SetLogWithExercise = SetLog & {
  exercise: Exercise;
};

export type ExerciseWithRelations = Exercise & {
  muscleGroups: ExerciseMuscleGroup[];
  equipment: ExerciseEquipment[];
  content: ExerciseContent[];
  musclesWorked: ExerciseMusclesWorked[];
  variations: (ExerciseVariation & {
    variation: Exercise;
  })[];
};

export type ExerciseWithMuscleGroupsAndEquipment = Exercise & {
  muscleGroups: ExerciseMuscleGroup[];
  equipment: ExerciseEquipment[];
};

export type WorkoutSessionSet = {
  setIndex: number;
  reps: string;
  weight: string;
  isCompleted: boolean;
};

export type GroupedExercise = {
  exercise: Exercise;
  sets: SetLog[];
};

export type WorkoutLogExtended = WorkoutLogWithRelations & {
  groupedExercises: GroupedExercise[];
  totalVolume: number;
};
