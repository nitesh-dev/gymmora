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

export interface ExerciseWithContent extends Exercise {
  content: ExerciseContent[];
}
