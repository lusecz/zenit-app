import { Exercise } from './workout';

export interface Routine {
  id: string;
  name: string;
  exercises: Exercise[];
}
