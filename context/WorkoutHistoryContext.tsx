import { WorkoutSession } from '@/types/workout-history';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useEffect, useState } from 'react';

interface WorkoutHistoryContextData {
  sessions: WorkoutSession[];
  currentSession: WorkoutSession | null;
  startWorkoutSession: (routineId: string, routineName: string, exercises: any[]) => void;
  finishWorkoutSession: () => void;
  updateCurrentSession: (exercises: any[]) => void;
  getSessionsByRoutine: (routineId: string) => WorkoutSession[];
  loading: boolean;
}

export const WorkoutHistoryContext = createContext<WorkoutHistoryContextData>(
  {} as WorkoutHistoryContextData
);

interface WorkoutHistoryProviderProps {
  children: ReactNode;
}

export function WorkoutHistoryProvider({ children }: WorkoutHistoryProviderProps) {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [currentSession, setCurrentSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldSave, setShouldSave] = useState(false);

  // Carregar histórico de treinos do AsyncStorage
  useEffect(() => {
    async function loadSessions() {
      try {
        const storedSessions = await AsyncStorage.getItem('@ZenitApp:workoutSessions');
        if (storedSessions) {
          setSessions(JSON.parse(storedSessions));
        }
      } catch (error) {
        console.error('Erro ao carregar histórico de treinos:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSessions();
  }, []);

  // Salvar histórico apenas quando necessário
  useEffect(() => {
    async function saveSessions() {
      if (!loading && shouldSave && sessions.length > 0) {
        try {
          await AsyncStorage.setItem('@ZenitApp:workoutSessions', JSON.stringify(sessions));
          setShouldSave(false);
        } catch (error) {
          console.error('Erro ao salvar histórico de treinos:', error);
        }
      }
    }
    saveSessions();
  }, [shouldSave, loading]);

  const startWorkoutSession = (routineId: string, routineName: string, exercises: any[]) => {
    const newSession: WorkoutSession = {
      id: `session_${Date.now()}`,
      routineId,
      routineName,
      exercises: exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        restTime: ex.restTime || 60,
        sets: ex.sets.map((set: any) => ({
          id: set.id,
          reps: set.reps,
          weight: set.weight,
          isCompleted: false,
        })),
      })),
      startTime: new Date().toISOString(),
      duration: 0,
      totalVolume: 0,
      totalSetsCompleted: 0,
      isFinished: false,
    };
    setCurrentSession(newSession);
  };

  const calculateStats = (exercises: any[]) => {
    let totalVolume = 0;
    let totalSetsCompleted = 0;

    exercises.forEach(exercise => {
      exercise.sets.forEach((set: any) => {
        if (set.isCompleted) {
          totalVolume += set.weight * set.reps;
          totalSetsCompleted += 1;
        }
      });
    });

    return { totalVolume, totalSetsCompleted };
  };

  const updateCurrentSession = (exercises: any[]) => {
    if (!currentSession) return;

    const stats = calculateStats(exercises);
    const duration = Math.floor((Date.now() - new Date(currentSession.startTime).getTime()) / 1000);

    setCurrentSession({
      ...currentSession,
      exercises: exercises.map(ex => ({
        id: ex.id,
        name: ex.name,
        restTime: ex.restTime || 60,
        sets: ex.sets.map((set: any) => ({
          id: set.id,
          reps: set.reps,
          weight: set.weight,
          isCompleted: set.isCompleted,
          completedAt: set.isCompleted ? new Date().toISOString() : undefined,
        })),
      })),
      duration,
      totalVolume: stats.totalVolume,
      totalSetsCompleted: stats.totalSetsCompleted,
    });
  };

  const finishWorkoutSession = () => {
    if (!currentSession) return;

    const finishedSession: WorkoutSession = {
      ...currentSession,
      endTime: new Date().toISOString(),
      isFinished: true,
    };

    setSessions(prev => [finishedSession, ...prev]);
    setShouldSave(true);
    setCurrentSession(null);
  };

  const getSessionsByRoutine = (routineId: string) => {
    return sessions.filter(session => session.routineId === routineId);
  };

  return (
    <WorkoutHistoryContext.Provider
      value={{
        sessions,
        currentSession,
        startWorkoutSession,
        finishWorkoutSession,
        updateCurrentSession,
        getSessionsByRoutine,
        loading,
      }}>
      {children}
    </WorkoutHistoryContext.Provider>
  );
}
