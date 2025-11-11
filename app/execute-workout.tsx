import { RoutineContext } from '@/context/RoutineContext';
import { WorkoutHistoryContext } from '@/context/WorkoutHistoryContext';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Configuração das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function ExecuteWorkoutScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { getRoutine } = useContext(RoutineContext);
  const { currentSession, startWorkoutSession, finishWorkoutSession, updateCurrentSession } =
    useContext(WorkoutHistoryContext);

  const routine = useMemo(() => getRoutine(routineId!), [routineId, getRoutine]);

  const [sessionExercises, setSessionExercises] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [activeTimers, setActiveTimers] = useState<Map<string, any>>(new Map());
  const [activeNotifications, setActiveNotifications] = useState<Map<string, string>>(new Map());
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Configurar permissões de notificação
  useEffect(() => {
    const configurateNotifications = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      await Notifications.requestPermissionsAsync();
    };
    configurateNotifications();
  }, []);

  // Iniciar sessão de treino apenas uma vez
  useEffect(() => {
    if (routine && routine.exercises && routine.exercises.length > 0) {
      console.log('Iniciando sessão com', routine.exercises.length, 'exercícios');
      
      const exercisesWithSets = routine.exercises.map(ex => ({
        ...ex,
        sets: ex.sets && ex.sets.length > 0 
          ? ex.sets.map((set: any) => ({ ...set, isCompleted: false }))
          : [],
      }));
      
      console.log('Exercícios com séries:', exercisesWithSets);
      
      setSessionExercises(exercisesWithSets);
      setStartTime(new Date());
      
      if (!currentSession) {
        startWorkoutSession(routine.id, routine.name, exercisesWithSets);
      }
    }
  }, [routine?.id]); // Dependência no ID para evitar loops

  // Atualizar cronômetro
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Não usar useEffect para atualizar sessão - fazer manualmente quando necessário
  // Para evitar loops infinitos, vamos atualizar apenas quando finalizar o treino

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const cancelRestTimer = (exerciseId: string) => {
    const timer = activeTimers.get(exerciseId);
    if (timer) {
      clearTimeout(timer);
      setActiveTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(exerciseId);
        return newMap;
      });
    }

    const notificationId = activeNotifications.get(exerciseId);
    if (notificationId) {
      Notifications.cancelScheduledNotificationAsync(notificationId);
      setActiveNotifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(exerciseId);
        return newMap;
      });
    }
  };

  const showRestStartConfirmation = (exerciseName: string, restTime: number) => {
    showToastMessage(`⏱️ Descanso de ${restTime}s iniciado para ${exerciseName}`);
  };

  const startRestTimer = async (exerciseId: string, exerciseName: string, restTime: number) => {
    cancelRestTimer(exerciseId);
    showRestStartConfirmation(exerciseName, restTime);

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Descanso Finalizado!',
          body: `Tempo de descanso de ${restTime}s terminou. Próxima série de ${exerciseName}!`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: restTime,
          repeats: false,
        },
      });

      setActiveNotifications(prev => new Map(prev).set(exerciseId, notificationId));
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  };

  const handleSetCompletion = async (exerciseId: string, setId: string) => {
    const exerciseIndex = sessionExercises.findIndex(ex => ex.id === exerciseId);
    if (exerciseIndex === -1) return;

    const exercise = sessionExercises[exerciseIndex];
    const setIndex = exercise.sets.findIndex((s: any) => s.id === setId);
    if (setIndex === -1) return;

    const set = exercise.sets[setIndex];
    const isCurrentlyCompleted = set.isCompleted;

    const newExercises = [...sessionExercises];
    newExercises[exerciseIndex] = {
      ...exercise,
      sets: exercise.sets.map((s: any) =>
        s.id === setId ? { ...s, isCompleted: !isCurrentlyCompleted } : s
      ),
    };

    setSessionExercises(newExercises);

    if (!isCurrentlyCompleted && exercise.restTime && exercise.restTime > 0) {
      await startRestTimer(exerciseId, exercise.name, exercise.restTime);
    }
  };

  const handleSetUpdate = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: string) => {
    const numValue = field === 'reps' ? parseInt(value) || 0 : parseFloat(value) || 0;

    setSessionExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s: any) =>
                s.id === setId ? { ...s, [field]: numValue } : s
              ),
            }
          : ex
      )
    );
  };

  const calculateStats = () => {
    let totalVolume = 0;
    let totalSetsCompleted = 0;

    sessionExercises.forEach(exercise => {
      exercise.sets.forEach((set: any) => {
        if (set.isCompleted) {
          totalVolume += set.weight * set.reps;
          totalSetsCompleted += 1;
        }
      });
    });

    return { totalVolume, totalSetsCompleted };
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  const getDuration = () => {
    return Math.floor((currentTime.getTime() - startTime.getTime()) / 1000);
  };

  const handleFinishWorkout = () => {
    const stats = calculateStats();
    const duration = getDuration();

    Alert.alert(
      'Finalizar Treino',
      `Resumo do treino:\n\n` +
        `⏱️ Duração: ${formatDuration(duration)}\n` +
        `💪 Volume Total: ${stats.totalVolume.toFixed(1)} kg\n` +
        `✅ Séries Completadas: ${stats.totalSetsCompleted}\n\n` +
        `Deseja finalizar e salvar este treino?`,
      [
        { text: 'Continuar Treinando', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'default',
          onPress: () => {
            // Atualizar sessão com os dados finais antes de salvar
            updateCurrentSession(sessionExercises);
            // Dar um pequeno delay para garantir que a atualização foi processada
            setTimeout(() => {
              finishWorkoutSession();
              showToastMessage('🎉 Treino finalizado e salvo!');
              setTimeout(() => {
                router.back();
              }, 1500);
            }, 100);
          },
        },
      ]
    );
  };

  const handleCancelWorkout = () => {
    Alert.alert(
      'Cancelar Treino',
      'Deseja realmente cancelar? O treino não será salvo.',
      [
        { text: 'Continuar Treinando', style: 'cancel' },
        {
          text: 'Cancelar Treino',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Rotina não encontrada</Text>
      </SafeAreaView>
    );
  }

  const stats = calculateStats();
  const duration = getDuration();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Compact Action Bar */}
      <View style={styles.compactActionBar}>
        <TouchableOpacity onPress={handleCancelWorkout} style={styles.compactCancelButton}>
          <Ionicons name="close-circle" size={24} color="#F43F5E" />
          <Text style={styles.compactCancelText}>Cancelar</Text>
        </TouchableOpacity>
        <Text style={styles.compactTitle}>{routine.name}</Text>
        <TouchableOpacity onPress={handleFinishWorkout} style={styles.compactFinishButton}>
          <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
          <Text style={styles.compactFinishText}>Finalizar</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={20} color="#22C55E" />
          <Text style={styles.statLabel}>Duração</Text>
          <Text style={styles.statValue}>{formatDuration(duration)}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="barbell-outline" size={20} color="#22C55E" />
          <Text style={styles.statLabel}>Volume</Text>
          <Text style={styles.statValue}>{stats.totalVolume.toFixed(0)} kg</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Ionicons name="checkmark-done-outline" size={20} color="#22C55E" />
          <Text style={styles.statLabel}>Séries</Text>
          <Text style={styles.statValue}>{stats.totalSetsCompleted}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {sessionExercises.map((exercise, exerciseIndex) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            {/* Nome do Exercício */}
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>
                {exerciseIndex + 1}. {exercise.name}
              </Text>
              {exercise.restTime > 0 && (
                <View style={styles.restTimeBadge}>
                  <Ionicons name="timer-outline" size={16} color="#22C55E" />
                  <Text style={styles.restTimeText}>{exercise.restTime}s</Text>
                </View>
              )}
            </View>

            {/* Cabeçalho das Séries */}
            <View style={styles.setsHeader}>
              <Text style={[styles.setsHeaderText, { flex: 0.8 }]}>SÉRIE</Text>
              <Text style={[styles.setsHeaderText, { flex: 1 }]}>KG</Text>
              <Text style={[styles.setsHeaderText, { flex: 1 }]}>REPS</Text>
              <Text style={[styles.setsHeaderText, { flex: 0.6 }]}>✓</Text>
            </View>

            {/* Séries */}
            {exercise.sets.map((set: any, setIndex: number) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={[styles.setNumber, { flex: 0.8 }, set.isCompleted && styles.setTextCompleted]}>
                  {setIndex + 1}
                </Text>
                <TextInput
                  style={[styles.setInput, { flex: 1 }, set.isCompleted && styles.setTextCompleted]}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#475569"
                  value={set.weight?.toString() || ''}
                  onChangeText={(value) => handleSetUpdate(exercise.id, set.id, 'weight', value)}
                  editable={!set.isCompleted}
                />
                <TextInput
                  style={[styles.setInput, { flex: 1 }, set.isCompleted && styles.setTextCompleted]}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#475569"
                  value={set.reps?.toString() || ''}
                  onChangeText={(value) => handleSetUpdate(exercise.id, set.id, 'reps', value)}
                  editable={!set.isCompleted}
                />
                <TouchableOpacity
                  style={[styles.checkbox, { flex: 0.6 }]}
                  onPress={() => handleSetCompletion(exercise.id, set.id)}>
                  <Ionicons
                    name={set.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={28}
                    color={set.isCompleted ? '#22C55E' : '#64748B'}
                  />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Toast */}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  compactActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  compactCancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#7F1D1D',
    borderRadius: 20,
  },
  compactCancelText: {
    color: '#F43F5E',
    fontSize: 13,
    fontWeight: '600',
  },
  compactTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E2E8F0',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 12,
  },
  compactFinishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#064E3B',
    borderRadius: 20,
  },
  compactFinishText: {
    color: '#22C55E',
    fontSize: 13,
    fontWeight: '600',
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#334155',
    marginHorizontal: 6,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 15,
    color: '#E2E8F0',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  errorText: {
    color: '#F43F5E',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  exerciseCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#E2E8F0',
    flex: 1,
  },
  restTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#064E3B',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  restTimeText: {
    color: '#22C55E',
    fontSize: 12,
    fontWeight: '600',
  },
  setsHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    marginBottom: 8,
  },
  setsHeaderText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  setNumber: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  setInput: {
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    fontSize: 16,
    padding: 10,
    borderRadius: 6,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  setTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  checkbox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomSpacer: {
    height: 20,
  },
  toast: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#22C55E',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
});
