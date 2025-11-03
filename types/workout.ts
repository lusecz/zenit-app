export interface ExerciseSet {
  id: string;
  reps: number;
  weight: number;
  isCompleted: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
  restTime: number;
}
