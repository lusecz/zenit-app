export interface SetLog {
  id: string;
  reps: number;
  weight: number;
  isCompleted: boolean;
  completedAt?: string; // ISO timestamp
}

export interface ExerciseLog {
  id: string;
  name: string;
  sets: SetLog[];
  restTime: number;
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  exercises: ExerciseLog[];
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  duration: number; // em segundos
  totalVolume: number; // soma de (peso * reps) de todas as séries completadas
  totalSetsCompleted: number;
  isFinished: boolean;
}

export interface WorkoutStats {
  totalVolume: number;
  totalSetsCompleted: number;
  duration: number; // em segundos
}
