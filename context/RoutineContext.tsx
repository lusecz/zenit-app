import { Routine } from '@/types/routine';
import { Exercise, ExerciseSet } from '@/types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface RoutineContextData {
  routines: Routine[];
  addRoutine: (name: string) => void;
  updateRoutine: (routineId: string, newName: string) => void;
  removeRoutine: (routineId: string) => void;
  getRoutine: (routineId: string) => Routine | undefined;
  addExercise: (routineId: string, name: string) => void;
  updateExercise: (routineId: string, exerciseId: string, newName: string) => void;
  updateExerciseRestTime: (routineId: string, exerciseId: string, restTime: number) => void;
  removeExercise: (routineId: string, exerciseId: string) => void;
  addSet: (routineId: string, exerciseId: string) => void;
  updateSet: (routineId: string, exerciseId: string, setId: string, reps: number, weight: number) => void;
  toggleSetCompletion: (routineId: string, exerciseId: string, setId: string) => void;
  removeSet: (routineId: string, exerciseId: string, setId: string) => void;
  loading: boolean;
}

export const RoutineContext = createContext<RoutineContextData>({} as RoutineContextData);

interface RoutineProviderProps {
  children: ReactNode;
}

export function RoutineProvider({ children }: RoutineProviderProps) {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRoutines() {
      try {
        const storedRoutines = await AsyncStorage.getItem('@ZenitApp:routines');
        if (storedRoutines) {
          setRoutines(JSON.parse(storedRoutines));
        }
      } catch (error) {
        console.error("Failed to load routines from storage", error);
      } finally {
        setLoading(false);
      }
    }
    loadRoutines();
  }, []);

  useEffect(() => {
    async function saveRoutines() {
      try {
        await AsyncStorage.setItem('@ZenitApp:routines', JSON.stringify(routines));
      } catch (error) {
        console.error("Failed to save routines to storage", error);
      }
    }
    if (!loading) {
      saveRoutines();
    }
  }, [routines, loading]);

  const addRoutine = (name: string) => {
    const newRoutine: Routine = {
      id: uuidv4(),
      name,
      exercises: [],
    };
    setRoutines(prev => [...prev, newRoutine]);
  };

  const updateRoutine = (routineId: string, newName: string) => {
    setRoutines(prev =>
      prev.map(r => r.id === routineId ? { ...r, name: newName } : r)
    );
  };

  const removeRoutine = (routineId: string) => {
    setRoutines(prev => prev.filter(r => r.id !== routineId));
  };

  const getRoutine = (routineId: string) => {
    return routines.find(r => r.id === routineId);
  };

  const addExercise = (routineId: string, name: string) => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name,
      sets: [],
      restTime: 60, // padrão de 60 segundos
    };
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: [...r.exercises, newExercise] }
          : r
      )
    );
  };

  const updateExercise = (routineId: string, exerciseId: string, newName: string) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, name: newName } : ex) }
          : r
      )
    );
  };

  const updateExerciseRestTime = (routineId: string, exerciseId: string, restTime: number) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, restTime } : ex) }
          : r
      )
    );
  };

  const removeExercise = (routineId: string, exerciseId: string) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.filter(ex => ex.id !== exerciseId) }
          : r
      )
    );
  };

  const addSet = (routineId: string, exerciseId: string) => {
    const newSet: ExerciseSet = {
      id: uuidv4(),
      reps: 0,
      weight: 0,
      isCompleted: false,
    };
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex) }
          : r
      )
    );
  };

  const updateSet = (routineId: string, exerciseId: string, setId: string, reps: number, weight: number) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, reps, weight } : s) } : ex) }
          : r
      )
    );
  };

  const toggleSetCompletion = (routineId: string, exerciseId: string, setId: string) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, isCompleted: !s.isCompleted } : s) } : ex) }
          : r
      )
    );
  };

  const removeSet = (routineId: string, exerciseId: string, setId: string) => {
    setRoutines(prev =>
      prev.map(r =>
        r.id === routineId
          ? { ...r, exercises: r.exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } : ex) }
          : r
      )
    );
  };

  return (
    <RoutineContext.Provider value={{
      routines,
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
      loading
    }}>
      {children}
    </RoutineContext.Provider>
  );
}
