import { Exercise, ExerciseSet } from '@/types/workout';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

interface WorkoutContextData {
  exercises: Exercise[];
  addExercise: (name: string) => void;
  updateExercise: (exerciseId: string, newName: string) => void;
  removeExercise: (exerciseId: string) => void;
  addSet: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, reps: number, weight: number) => void;
  toggleSetCompletion: (exerciseId: string, setId: string) => void;
  removeSet: (exerciseId: string, setId: string) => void;
  loading: boolean;
}

export const WorkoutContext = createContext<WorkoutContextData>({} as WorkoutContextData);

interface WorkoutProviderProps {
  children: ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExercises() {
      try {
        const storedExercises = await AsyncStorage.getItem('@ZenitApp:exercises');
        if (storedExercises) {
          setExercises(JSON.parse(storedExercises));
        }
      } catch (error) {
        console.error("Failed to load exercises from storage", error);
      } finally {
        setLoading(false);
      }
    }
    loadExercises();
  }, []);

  useEffect(() => {
    async function saveExercises() {
      try {
        await AsyncStorage.setItem('@ZenitApp:exercises', JSON.stringify(exercises));
      } catch (error) {
        console.error("Failed to save exercises to storage", error);
      }
    }
    if (!loading) {
      saveExercises();
    }
  }, [exercises, loading]);

  const addExercise = (name: string) => {
    const newExercise: Exercise = {
      id: uuidv4(),
      name,
      sets: [],
      restTime: 60, // padrão de 60 segundos
    };
    setExercises(prev => [...prev, newExercise]);
  };

  const updateExercise = (exerciseId: string, newName: string) => {
    setExercises(prev => 
      prev.map(ex => ex.id === exerciseId ? { ...ex, name: newName } : ex)
    );
  };

  const removeExercise = (exerciseId: string) => {
    setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    const newSet: ExerciseSet = {
      id: uuidv4(),
      reps: 0,
      weight: 0,
      isCompleted: false,
    };
    setExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex
      )
    );
  };

  const updateSet = (exerciseId: string, setId: string, reps: number, weight: number) => {
    setExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, reps, weight } : s) } 
          : ex
      )
    );
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, isCompleted: !s.isCompleted } : s) }
          : ex
      )
    );
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(prev => 
      prev.map(ex => 
        ex.id === exerciseId 
          ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } 
          : ex
      )
    );
  };

  return (
    <WorkoutContext.Provider value={{ 
      exercises, 
      addExercise, 
      updateExercise,
      removeExercise,
      addSet, 
      updateSet,
      toggleSetCompletion,
      removeSet,
      loading 
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}
