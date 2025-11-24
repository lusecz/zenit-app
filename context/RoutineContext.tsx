import { Routine } from '@/types/routine';
import { Exercise, ExerciseSet } from '@/types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface RoutineContextData {
  routines: Routine[];
  loading: boolean;

  addRoutine: (name: string) => { success: boolean; message: string };
  updateRoutine: (routineId: string, newName: string) => { success: boolean; message: string };
  removeRoutine: (routineId: string) => { success: boolean; message: string };

  getRoutine: (routineId: string) => Routine | undefined;

  addExercise: (routineId: string, name: string) => { success: boolean; message: string };
  updateExercise: (routineId: string, exerciseId: string, newName: string) => { success: boolean; message: string };
  updateExerciseRestTime: (routineId: string, exerciseId: string, restTime: number) => void;
  removeExercise: (routineId: string, exerciseId: string) => { success: boolean; message: string };

  addSet: (routineId: string, exerciseId: string) => { success: boolean; message: string };
  updateSet: (routineId: string, exerciseId: string, setId: string, reps: number, weight: number) => { success: boolean; message: string };
  toggleSetCompletion: (routineId: string, exerciseId: string, setId: string) => void;
  removeSet: (routineId: string, exerciseId: string, setId: string) => { success: boolean; message: string };
}

export const RoutineContext = createContext<RoutineContextData>({} as RoutineContextData);

interface RoutineProviderProps {
  children: ReactNode;
}

export function RoutineProvider({ children }: RoutineProviderProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  // ───────────────────────────────────────────
  // LOAD DATA
  // ───────────────────────────────────────────
  useEffect(() => {
    async function loadRoutines() {
      try {
        const stored = await AsyncStorage.getItem('@ZenitApp:routines');
        if (stored) {
          setRoutines(JSON.parse(stored));
        }
      } catch (error) {
        console.error("Failed to load routines from storage", error);
      } finally {
        setLoading(false);
      }
    }
    loadRoutines();
  }, []);

  // ───────────────────────────────────────────
  // SAVE DATA
  // ───────────────────────────────────────────
  useEffect(() => {
    async function saveRoutines() {
      try {
        await AsyncStorage.setItem('@ZenitApp:routines', JSON.stringify(routines));
      } catch (error) {
        console.error("Failed to save routines", error);
      }
    }
    if (!loading) saveRoutines();
  }, [routines, loading]);

  // Helpers
  const normalize = (text: string) => text.trim().toLowerCase();

  // ───────────────────────────────────────────
  // ROUTINES CRUD
  // ───────────────────────────────────────────

  const addRoutine = (name: string) => {
    const clean = name.trim();

    if (clean.length < 2) {
      return { success: false, message: "O nome da rotina deve ter pelo menos 2 caracteres." };
    }

    const exists = routines.some(r => normalize(r.name) === normalize(clean));
    if (exists) {
      return { success: false, message: "Já existe uma rotina com esse nome." };
    }

    const newRoutine: Routine = {
      id: uuidv4(),
      name: clean,
      exercises: [],
    };

    setRoutines(prev => [...prev, newRoutine]);

    return { success: true, message: "Rotina criada com sucesso!" };
  };

  const updateRoutine = (routineId: string, newName: string) => {
    const clean = newName.trim();

    if (clean.length < 2) {
      return { success: false, message: "O nome da rotina deve ter pelo menos 2 caracteres." };
    }

    const routine = routines.find(r => r.id === routineId);
    if (!routine) {
      return { success: false, message: "Rotina não encontrada." };
    }

    const duplicate = routines.some(
      r => normalize(r.name) === normalize(clean) && r.id !== routineId
    );

    if (duplicate) {
      return { success: false, message: "Já existe outra rotina com esse nome." };
    }

    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, name: clean }
          : r
      )
    );

    return { success: true, message: "Rotina atualizada!" };
  };

  const removeRoutine = (routineId: string) => {
    const exists = routines.some(r => r.id === routineId);
    if (!exists) {
      return { success: false, message: "Rotina não encontrada." };
    }

    setRoutines(prev => prev.filter(r => r.id !== routineId));

    return { success: true, message: "Rotina removida." };
  };

  const getRoutine = (routineId: string) => {
    return routines.find(r => r.id === routineId);
  };

  // ───────────────────────────────────────────
  // EXERCISES CRUD
  // ───────────────────────────────────────────

  const addExercise = (routineId: string, name: string) => {
    const clean = name.trim();

    if (clean.length < 2) {
      return { success: false, message: "O nome do exercício deve ter pelo menos 2 caracteres." };
    }

    const routine = getRoutine(routineId);
    if (!routine) {
      return { success: false, message: "Rotina não encontrada." };
    }

    const duplicate = routine.exercises.some(ex => normalize(ex.name) === normalize(clean));

    if (duplicate) {
      return { success: false, message: "Essa rotina já contém um exercício com esse nome." };
    }

    const newExercise: Exercise = {
      id: uuidv4(),
      name: clean,
      sets: [],
      restTime: 60,
    };

    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: [...r.exercises, newExercise] }
          : r
      )
    );

    return { success: true, message: "Exercício adicionado!" };
  };

  const updateExercise = (routineId: string, exerciseId: string, newName: string) => {
    const clean = newName.trim();

    if (clean.length < 2) {
      return { success: false, message: "O nome do exercício deve ter pelo menos 2 caracteres." };
    }

    const routine = getRoutine(routineId);
    if (!routine) {
      return { success: false, message: "Rotina não encontrada." };
    }

    const duplicate = routine.exercises.some(
      ex => normalize(ex.name) === normalize(clean) && ex.id !== exerciseId
    );

    if (duplicate) {
      return { success: false, message: "Já existe outro exercício com esse nome nesta rotina." };
    }

    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? {
              ...r,
              exercises: r.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, name: clean } : ex
              ),
            }
          : r
      )
    );

    return { success: true, message: "Exercício atualizado!" };
  };

  const updateExerciseRestTime = (routineId: string, exerciseId: string, restTime: number) => {
    const safeValue = Math.max(0, isNaN(restTime) ? 60 : restTime);

    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? {
              ...r,
              exercises: r.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, restTime: safeValue } : ex
              ),
            }
          : r
      )
    );
  };

  const removeExercise = (routineId: string, exerciseId: string) => {
    const routine = getRoutine(routineId);
    if (!routine) {
      return { success: false, message: "Rotina não encontrada." };
    }

    const exists = routine.exercises.some(ex => ex.id === exerciseId);
    if (!exists) {
      return { success: false, message: "Exercício não encontrado." };
    }

    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.filter(ex => ex.id !== exerciseId) }
          : r
      )
    );

    return { success: true, message: "Exercício removido." };
  };

  // ───────────────────────────────────────────
  // SETS CRUD
  // ───────────────────────────────────────────

  const addSet = (routineId: string, exerciseId: string) => {
    const routine = getRoutine(routineId);
    if (!routine) return { success: false, message: "Rotina não encontrada." };

    const exercise = routine.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return { success: false, message: "Exercício não encontrado." };

    const newSet: ExerciseSet = {
      id: uuidv4(),
      reps: 0,
      weight: 0,
      isCompleted: false,
    };

    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? {
              ...r,
              exercises: r.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
              ),
            }
          : r
      )
    );

    return { success: true, message: "Série adicionada!" };
  };

  const updateSet = (routineId: string, exerciseId: string, setId: string, reps: number, weight: number) => {
    const safeReps = Math.max(0, isNaN(reps) ? 0 : reps);
    const safeWeight = Math.max(0, isNaN(weight) ? 0 : weight);

    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? {
              ...r,
              exercises: r.exercises.map(ex =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map(s =>
                        s.id === setId ? { ...s, reps: safeReps, weight: safeWeight } : s
                      ),
                    }
                  : ex
              ),
            }
          : r
      )
    );

    return { success: true, message: "Série atualizada!" };
  };

  const toggleSetCompletion = (routineId: string, exerciseId: string, setId: string) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? {
              ...r,
              exercises: r.exercises.map(ex =>
                ex.id === exerciseId
                  ? {
                      ...ex,
                      sets: ex.sets.map(s =>
                        s.id === setId ? { ...s, isCompleted: !s.isCompleted } : s
                      ),
                    }
                  : ex
              ),
            }
          : r
      )
    );
  };

  const removeSet = (routineId: string, exerciseId: string, setId: string) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? {
              ...r,
              exercises: r.exercises.map(ex =>
                ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } : ex
              ),
            }
          : r
      )
    );

    return { success: true, message: "Série removida." };
  };

  // ───────────────────────────────────────────
  // PROVIDER
  // ───────────────────────────────────────────

  return (
    <RoutineContext.Provider
      value={{
        routines,
        loading,
        addRoutine,
        updateRoutine,
        removeRoutine,
        getRoutine,
        addExercise,
        updateExercise,
        updateExerciseRestTime,
        removeExercise,
        addSet,
        updateSet,
        toggleSetCompletion,
        removeSet,
      }}
    >
      {children}
    </RoutineContext.Provider>
  );
}
