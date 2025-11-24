// /data/exercise-library-groups.ts

import { EXERCISE_LIBRARY } from './exercise-library';

export const EXERCISE_LIBRARY_GROUPS = EXERCISE_LIBRARY.reduce((acc, ex) => {
  if (!acc[ex.group]) acc[ex.group] = [];
  acc[ex.group].push(ex);
  return acc;
}, {} as Record<string, typeof EXERCISE_LIBRARY>);
