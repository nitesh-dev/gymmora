export interface Exercise {
  id: string;
  title: string;
  url: string | null;
  overview: string | null;
  gifUrl: string | null;
  musclesWorkedImg: string | null;
  isDeleted: boolean;
  updatedAt: string;
}

export interface ExerciseContent {
  id: string;
  exerciseId: string;
  contentType: 'step' | 'benefit' | 'tip' | 'mistake';
  contentText: string;
  orderIndex: number;
}

export interface ExerciseMuscleWorked {
  id: string;
  exerciseId: string;
  name: string;
  percentage: number;
}

export interface ExerciseMuscleGroup {
  id: string;
  exerciseId: string;
  name: string;
}

export interface ExerciseEquipment {
  id: string;
  exerciseId: string;
  name: string;
}

export interface ExerciseWithContent extends Exercise {
  content: ExerciseContent[];
  musclesWorked: ExerciseMuscleWorked[];
  muscleGroups: ExerciseMuscleGroup[];
  equipment: ExerciseEquipment[];
  variations: Exercise[];
}
