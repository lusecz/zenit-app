import AppLayout from "@/components/AppLayout";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  AppState,
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { RoutineContext } from "@/context/RoutineContext";
import { WorkoutHistoryContext } from "@/context/WorkoutHistoryContext";
import { EXERCISE_LIBRARY } from "@/data/exercise-library";

// Importações condicionais para notificações (não funciona no Expo Go)
let Notifications: any = null;
try {
  Notifications = require('expo-notifications');
  // Configurar comportamento das notificações apenas se disponível
  if (Notifications) {
    // Mostrar notificações sempre, incluindo quando o app está em foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification: any) => {
        return {
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        };
      },
    });
  }
} catch (error) {
  console.log('Notificações não disponíveis no Expo Go');
}

type ExerciseSetLocal = {
  id: string;
  reps?: number;
  weight?: number;
  isCompleted?: boolean;
};

type ExerciseLocal = {
  id: string;
  name: string;
  restTime: number;
  sets: ExerciseSetLocal[];
  youtube?: string;
};

function useAnimatedValue(initial = 0) {
  const v = useRef(new Animated.Value(initial)).current;
  return v;
}

export default function ExecuteWorkoutScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();

  const { routines } = useContext(RoutineContext);
  const {
    currentSession,
    startWorkoutSession,
    updateCurrentSession,
    finishWorkoutSession,
  } = useContext(WorkoutHistoryContext);

  const routine = useMemo(
    () => routines.find((r) => r.id === routineId),
    [routines, routineId]
  );

  useEffect(() => {
    if (!routine) router.replace("/routines");
  }, [routine]);

  if (!routine) {
    return (
      <AppLayout style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={{ padding: 20 }}>
          <Text style={{ color: "#94a3b8" }}>Rotina não encontrada.</Text>
        </View>
      </AppLayout>
    );
  }

  useEffect(() => {
    if (!currentSession) {
      startWorkoutSession(routine.id, routine.name, routine.exercises);
    }
  }, []);

  const session = useMemo(() => {
    if (currentSession) return currentSession;
    return {
      id: `tmp_${Date.now()}`,
      routineId: routine.id,
      routineName: routine.name,
      exercises: (routine.exercises || []).map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        restTime: ex.restTime ?? 60,
        sets: (ex.sets ?? []).map((s: any) => ({
          ...s,
          isCompleted: false,
        })),
        youtube: ex.youtube,
      })),
    };
  }, [currentSession, routine]);

  const [exercises, setExercises] = useState<ExerciseLocal[]>(
    (session.exercises || []).map((ex: any) => ({
      id: ex.id,
      name: ex.name,
      restTime: ex.restTime ?? 60,
      sets: (ex.sets || []).map((s: any) => ({
        id: s.id,
        reps: s.reps ?? 0,
        weight: s.weight ?? 0,
        isCompleted: !!s.isCompleted,
      })),
      youtube: ex.youtube,
    }))
  );

  useEffect(() => {
    setExercises(
      (session.exercises || []).map((ex: any) => ({
        id: ex.id,
        name: ex.name,
        restTime: ex.restTime ?? 60,
        sets: (ex.sets || []).map((s: any) => ({
          id: s.id,
          reps: s.reps ?? 0,
          weight: s.weight ?? 0,
          isCompleted: !!s.isCompleted,
        })),
        youtube: ex.youtube,
      }))
    );
  }, [session.exercises]);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const [totalSeconds, setTotalSeconds] = useState(0);
  const [totalRunning, setTotalRunning] = useState(false);
  const totalTimerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  const [restBarVisible, setRestBarVisible] = useState(false);
  const [restCountdown, setRestCountdown] = useState(0);
  const restTimerRef = useRef<number | null>(null);
  const restStartTimeRef = useRef<number | null>(null);
  const restEndTimeRef = useRef<number | null>(null);
  const shouldGoToNextExercise = useRef(false);
  const notificationScheduledRef = useRef(false);

  const [transitioning, setTransitioning] = useState(false);

  // Estados para edição de série durante execução
  const [editingSetIndex, setEditingSetIndex] = useState<number | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editReps, setEditReps] = useState("");

  // Estado para editar tempo de descanso
  const [editingRestTime, setEditingRestTime] = useState(false);
  const [customRestTime, setCustomRestTime] = useState<number | null>(null);

  const progAnim = useAnimatedValue(0);
  const fadeAnim = useAnimatedValue(1);
  const translateY = useAnimatedValue(0);

  // Iniciar timer total ao montar o componente
  useEffect(() => {
    setTotalRunning(true);
  }, []);

  // Solicitar permissão para notificações (apenas se disponível)
  useEffect(() => {
    if (!Notifications) return;
    (async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permissão de notificação negada');
        }
      } catch (error) {
        console.log('Erro ao solicitar permissão de notificação');
      }
    })();
  }, []);

  // Timer de descanso com lógica de background usando timestamp
  useEffect(() => {
    if (!restBarVisible || restCountdown <= 0) {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
      restStartTimeRef.current = null;
      restEndTimeRef.current = null;
      return;
    }

    // Salvar timestamp de início e fim
    const now = Date.now();
    if (!restStartTimeRef.current) {
      restStartTimeRef.current = now;
      restEndTimeRef.current = now + (restCountdown * 1000);
      notificationScheduledRef.current = false;
    }

    // Iniciar timer de descanso baseado em timestamp real
    restTimerRef.current = setInterval(() => {
      const currentTime = Date.now();
      const remaining = Math.ceil((restEndTimeRef.current! - currentTime) / 1000);
      
      if (remaining <= 0) {
        // Disparar notificação quando o descanso termina
        if (Notifications && !notificationScheduledRef.current) {
          notificationScheduledRef.current = true;
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Descanso finalizado! 💪',
              body: 'Hora de continuar seu treino!',
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Disparar imediatamente
          }).catch(() => {});
        }
        
        setRestBarVisible(false);
        setRestCountdown(0);
        restStartTimeRef.current = null;
        restEndTimeRef.current = null;
        
        // Ir para próximo exercício se necessário
        if (shouldGoToNextExercise.current) {
          shouldGoToNextExercise.current = false;
          nextExerciseWithAnimation();
        }
      } else {
        setRestCountdown(remaining);
      }
    }, 100) as unknown as number;

    return () => {
      if (restTimerRef.current) {
        clearInterval(restTimerRef.current);
        restTimerRef.current = null;
      }
    };
  }, [restBarVisible]);

  // Listener para quando o app volta do background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && restBarVisible && restEndTimeRef.current) {
        // Recalcular tempo restante quando voltar do background
        const currentTime = Date.now();
        const remaining = Math.ceil((restEndTimeRef.current - currentTime) / 1000);
        
        if (remaining <= 0) {
          setRestBarVisible(false);
          setRestCountdown(0);
          restStartTimeRef.current = null;
          restEndTimeRef.current = null;
        } else {
          setRestCountdown(remaining);
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [restBarVisible]);

  useEffect(() => {
    if (totalRunning) {
      if (!totalTimerRef.current) {
        totalTimerRef.current = setInterval(() => {
          setTotalSeconds((s) => s + 1);
        }, 1000) as unknown as number;
      }
    } else {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
        totalTimerRef.current = null;
      }
    }
    return () => {
      if (totalTimerRef.current) {
        clearInterval(totalTimerRef.current);
      }
    };
  }, [totalRunning]);

  useEffect(() => {
    if (!running) {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = setInterval(() => setSeconds((s) => s + 1), 1000) as unknown as number;
    return () => {
      if (tickRef.current) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [running]);

  useEffect(() => {
    const cur = exercises[exerciseIndex];
    if (!cur) return;
    const total = Math.max(1, cur.restTime);
    Animated.timing(progAnim, {
      toValue: Math.min(seconds / total, 1),
      duration: 140,
      useNativeDriver: false,
    }).start();
  }, [seconds, exerciseIndex]);

  const formattedTime = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  const formattedTotal = useMemo(() => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, [totalSeconds]);

  const persistExerciseState = (next: ExerciseLocal[]) => {
    setExercises(next);
    try {
      updateCurrentSession(
        next.map((ex) => ({
          id: ex.id,
          name: ex.name,
          restTime: ex.restTime,
          sets: ex.sets,
          youtube: ex.youtube,
        }))
      );
    } catch {}
  };

  const findVideoUrlForExercise = (exercise: ExerciseLocal) => {
    try {
      if (typeof EXERCISE_LIBRARY === "object" && !Array.isArray(EXERCISE_LIBRARY)) {
        for (const groupKey of Object.keys(EXERCISE_LIBRARY)) {
          const list = (EXERCISE_LIBRARY as any)[groupKey];
          if (!Array.isArray(list)) continue;
          const found = list.find(
            (ex: any) =>
              (ex.id && ex.id === exercise.id) ||
              (ex.name && ex.name === exercise.name)
          );
          if (found && found.youtube) return found.youtube;
        }
      }
      if (Array.isArray(EXERCISE_LIBRARY)) {
        const found = EXERCISE_LIBRARY.find(
          (ex: any) =>
            (ex.id && ex.id === exercise.id) ||
            (ex.name && ex.name === exercise.name)
        );
        if (found && found.youtube) return found.youtube;
      }
    } catch {}
    if (exercise.youtube) return exercise.youtube;
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(exercise.name)}`;
  };

  const openEditSet = (setIndex: number) => {
    const currentSet = exercises[exerciseIndex]?.sets[setIndex];
    if (!currentSet) return;
    
    setEditingSetIndex(setIndex);
    setEditWeight(String(currentSet.weight));
    setEditReps(String(currentSet.reps));
  };

  const saveSetEdit = () => {
    if (editingSetIndex === null) return;

    const cloned = exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s })),
    }));
    const target = cloned[exerciseIndex];
    if (!target) return;

    const weight = parseFloat(editWeight) || 0;
    const reps = parseInt(editReps) || 0;

    target.sets[editingSetIndex].weight = weight;
    target.sets[editingSetIndex].reps = reps;

    persistExerciseState(cloned);
    setEditingSetIndex(null);
    setEditWeight("");
    setEditReps("");
  };

  const toggleSetComplete = (setIndex: number) => {
    const cloned = exercises.map((ex) => ({
      ...ex,
      sets: ex.sets.map((s) => ({ ...s })),
    }));
    const target = cloned[exerciseIndex];
    if (!target) return;

    target.sets[setIndex].isCompleted = !target.sets[setIndex].isCompleted;

    if (target.sets[setIndex].isCompleted) {
      setRunning(true);
      setSeconds(0);

      // Iniciar descanso entre séries
      const rest = customRestTime ?? target.restTime ?? 60;
      if (rest > 0) {
        setRestCountdown(rest);
        setRestBarVisible(true);
        setRunning(false);
      }
    }

    persistExerciseState(cloned);

    const allDone = target.sets.every((s) => s.isCompleted);
    if (allDone && target.sets[setIndex].isCompleted) {
      // Ao finalizar a última série do exercício, mostrar descanso e depois ir para o próximo
      const rest = customRestTime ?? target.restTime ?? 60;
      if (rest > 0) {
        setRestCountdown(rest);
        setRestBarVisible(true);
        setRunning(false);
        shouldGoToNextExercise.current = true;
      } else {
        nextExerciseWithAnimation();
      }
    }
  };

  const nextExerciseWithAnimation = () => {
    const next = exerciseIndex + 1;
    if (next >= exercises.length) {
      // Mostrar confirmação antes de finalizar
      Alert.alert(
        "Finalizar Treino",
        "Deseja finalizar o treino e ver os resultados?",
        [
          {
            text: "Cancelar",
            style: "cancel"
          },
          {
            text: "Finalizar",
            style: "default",
            onPress: () => {
              Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 12, duration: 200, useNativeDriver: true }),
              ]).start(() => {
                try {
                  // Calcular estatísticas antes de finalizar
                  const totalExercises = exercises.length;
                  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
                  const completedSets = exercises.reduce(
                    (sum, ex) => sum + ex.sets.filter((s) => s.isCompleted).length,
                    0
                  );
                  
                  // Calcular volume total (peso x reps das séries completadas)
                  const totalVolume = exercises.reduce((sum, ex) => {
                    return sum + ex.sets.reduce((setSum, set) => {
                      if (set.isCompleted) {
                        return setSum + ((set.weight ?? 0) * (set.reps ?? 0));
                      }
                      return setSum;
                    }, 0);
                  }, 0);
                  
                  // Usar o tempo total do contador (totalSeconds)
                  const minutes = Math.floor(totalSeconds / 60);
                  const seconds = totalSeconds % 60;
                  const timeFormatted = `${minutes}min ${seconds}s`;

                  const resultData = {
                    routineName: routine?.name || "Treino",
                    totalTime: timeFormatted,
                    totalExercises: totalExercises,
                    totalSets: completedSets,
                    totalVolume: `${totalVolume} kg`,
                  };

                  finishWorkoutSession();

                  router.replace({
                    pathname: "/result",
                    params: { data: JSON.stringify(resultData) }
                  });
                } catch (error) {
                  console.error("Erro ao finalizar treino:", error);
                  router.replace("/result");
                }
              });
            }
          }
        ]
      );
      return;
    }
    setTransitioning(true);
    
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 12, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setExerciseIndex(next);
      setSeconds(0);
      setRunning(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start(() => setTransitioning(false));
    });
  };

  const prevExercise = () => {
    if (exerciseIndex <= 0) return;
    const prev = exerciseIndex - 1;
    setTransitioning(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -12, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      setExerciseIndex(prev);
      setSeconds(0);
      setRunning(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start(() => setTransitioning(false));
    });
  };

  const estimatedTotalTime = useMemo(() => {
    let total = 0;
    exercises.forEach((ex) => {
      ex.sets.forEach(() => (total += 10));
      total += ex.restTime ?? 0;
    });
    return total;
  }, [exercises]);

  const currentExercise = exercises[exerciseIndex];

  const openExerciseVideo = async (exercise: ExerciseLocal) => {
    try {
      const url = findVideoUrlForExercise(exercise);
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Erro", "Não foi possível abrir o link do vídeo.");
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o vídeo.");
    }
  };

  const thumbnail = (() => {
    try {
      const url = findVideoUrlForExercise(currentExercise);
      if (!url.includes("youtube")) return null;
      const id = url.split("v=")[1]?.split("&")[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
    } catch {
      return null;
    }
  })();

  const handleBackPress = () => {
    Alert.alert(
      "Sair do treino?",
      "Você tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sair", style: "destructive", onPress: () => router.push("/routines") },
      ]
    );
  };

  return (
    <AppLayout style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back-circle" size={26} color="#94a3b8" />
        </TouchableOpacity>

        <Text style={styles.title}>{routine.name}</Text>

        <TouchableOpacity
          onPress={() => openExerciseVideo(currentExercise)}
          style={{ padding: 6 }}
        >
          <Ionicons name="logo-youtube" size={22} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.topArea}>
        <View style={styles.exercisesProgressContainer}>
          {exercises.map((ex, i) => (
            <View
              key={ex.id}
              style={[
                styles.exerciseProgressBar,
                i < exerciseIndex && styles.exerciseProgressBarCompleted,
                i === exerciseIndex && styles.exerciseProgressBarCurrent
              ]}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.exerciseName}>{currentExercise?.name}</Text>
                <Text style={styles.seriesInfo}>
                  Série{" "}
                  {(currentExercise?.sets.filter((s) => s.isCompleted).length ?? 0) + 1} /{" "}
                  {currentExercise?.sets.length}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.timerSmallLabel}>Tempo total</Text>
                <Text style={styles.timerTotal}>{formattedTotal}</Text>
              </View>
            </View>

            {thumbnail && (
              <View style={styles.videoCard}>
                <Image source={{ uri: thumbnail }} style={styles.videoThumb} />
                <TouchableOpacity
                  onPress={() => openExerciseVideo(currentExercise)}
                  style={styles.videoBtn}
                >
                  <Ionicons name="logo-youtube" size={20} color="#fff" />
                  <Text style={styles.videoBtnText}>Ver vídeo</Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.sideBtn} onPress={prevExercise}>
                <Ionicons name="chevron-back-circle-outline" size={40} color="#94a3b8" />
              </TouchableOpacity>

              <View style={styles.centerControls}>
                {/* Barra de progresso das séries */}
                <View style={styles.setsProgressContainer}>
                  {currentExercise?.sets?.map((set, idx) => (
                    <View
                      key={set.id}
                      style={[
                        styles.setProgressBar,
                        set.isCompleted && styles.setProgressBarCompleted
                      ]}
                    />
                  ))}
                </View>

                {/* Área de descanso centralizada */}
                <View style={styles.restTimeContainer}>
                  <Text style={styles.restTimeLabel}>Descanso</Text>
                  <TouchableOpacity
                    onPress={() => setEditingRestTime(true)}
                    style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                  >
                    <Text style={styles.restTimeValue}>
                      {String(Math.floor((customRestTime ?? currentExercise?.restTime ?? 60) / 60)).padStart(2, '0')}:{String((customRestTime ?? currentExercise?.restTime ?? 60) % 60).padStart(2, '0')}
                    </Text>
                    <Ionicons name="pencil" size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity style={styles.sideBtn} onPress={nextExerciseWithAnimation}>
                <Ionicons name="chevron-forward-circle-outline" size={40} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View style={{ marginTop: 14 }}>
              {currentExercise?.sets?.map((set, idx) => (
                <View key={set.id} style={[styles.setRow, set.isCompleted && styles.setRowDone]}>
                  <TouchableOpacity 
                    style={{ flex: 1 }}
                    onPress={() => toggleSetComplete(idx)}
                    activeOpacity={0.7}
                  >
                    <View>
                      <Text style={styles.setTitle}>Série {idx + 1}</Text>
                      <Text style={styles.setSub}>
                        {set.reps ?? 0} reps • {set.weight ?? 0} kg
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <TouchableOpacity 
                      onPress={() => openEditSet(idx)}
                      style={styles.editSetBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="create-outline" size={20} color="#64748b" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => toggleSetComplete(idx)}
                      activeOpacity={0.7}
                    >
                      {set.isCompleted ? (
                        <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                      ) : (
                        <Ionicons name="ellipse-outline" size={26} color="#64748b" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Barra de Descanso dentro do ScrollView */}
          {restBarVisible && (
            <View style={styles.restBar}>
              <View style={styles.restBarContent}>
                <TouchableOpacity
                  style={styles.restBarButton}
                  onPress={() => {
                    const newTime = Math.max(0, restCountdown - 15);
                    // Atualizar timestamps
                    const now = Date.now();
                    restStartTimeRef.current = now;
                    restEndTimeRef.current = now + (newTime * 1000);
                    setRestCountdown(newTime);
                    // Resetar flag de notificação
                    notificationScheduledRef.current = false;
                  }}
                >
                  <Ionicons name="remove-circle" size={24} color="#ef4444" />
                  <Text style={styles.restBarButtonText}>-15s</Text>
                </TouchableOpacity>

                <View style={styles.restBarTimerContainer}>
                  <Ionicons name="time-outline" size={20} color="#22c55e" />
                  <Text style={styles.restBarTimer}>{restCountdown}s</Text>
                </View>

                <TouchableOpacity
                  style={styles.restBarButton}
                  onPress={() => {
                    const newTime = restCountdown + 15;
                    // Atualizar timestamps
                    const now = Date.now();
                    restStartTimeRef.current = now;
                    restEndTimeRef.current = now + (newTime * 1000);
                    setRestCountdown(newTime);
                    // Resetar flag de notificação
                    notificationScheduledRef.current = false;
                  }}
                >
                  <Ionicons name="add-circle" size={24} color="#22c55e" />
                  <Text style={styles.restBarButtonText}>+15s</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.restBarSkipButton}
                onPress={() => {
                  setRestBarVisible(false);
                  setRestCountdown(0);
                  restStartTimeRef.current = null;
                  restEndTimeRef.current = null;
                  notificationScheduledRef.current = false;
                  
                  if (shouldGoToNextExercise.current) {
                    shouldGoToNextExercise.current = false;
                    nextExerciseWithAnimation();
                  }
                }}
              >
                <Text style={styles.restBarSkipText}>PULAR DESCANSO</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Modal de Edição de Série */}
      <Modal visible={editingSetIndex !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Editar Série {editingSetIndex !== null ? editingSetIndex + 1 : ""}</Text>
            
            <View style={styles.editInputContainer}>
              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Repetições</Text>
                <TextInput
                  style={styles.editInput}
                  value={editReps}
                  onChangeText={setEditReps}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>

              <View style={styles.editInputGroup}>
                <Text style={styles.editLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.editInput}
                  value={editWeight}
                  onChangeText={setEditWeight}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#64748b"
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.modalButton, { flex: 1 }]}
                onPress={saveSetEdit}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { flex: 1, backgroundColor: "#0B1220", borderWidth: 1, borderColor: "#17212a" },
                ]}
                onPress={() => {
                  setEditingSetIndex(null);
                  setEditWeight("");
                  setEditReps("");
                }}
              >
                <Text style={{ color: "#94a3b8", fontWeight: "600" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Edição de Tempo de Descanso */}
      <Modal visible={editingRestTime} transparent animationType="slide">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => {
            setEditingRestTime(false);
            setCustomRestTime(null);
          }}
        >
          <TouchableOpacity 
            activeOpacity={1} 
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalBox, { minHeight: 220 }]}>
              <Text style={styles.modalTitle}>Tempo de Descanso</Text>
              <Text style={styles.modalSub}>Digite o tempo em segundos</Text>

              <TextInput
                style={[styles.editInput, { fontSize: 32, marginTop: 24, marginBottom: 24 }]}
                value={
                  customRestTime !== null
                    ? String(customRestTime)
                    : String(currentExercise?.restTime ?? 60)
                }
                onChangeText={(text) => {
                  const num = parseInt(text) || 0;
                  setCustomRestTime(num);
                }}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor="#64748b"
                autoFocus
                selectTextOnFocus
              />

              <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                <TouchableOpacity
                  style={[styles.modalButton, { flex: 1 }]}
                  onPress={() => setEditingRestTime(false)}
                >
                  <Text style={{ color: "#fff", fontWeight: "600" }}>Salvar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { flex: 1, backgroundColor: "#0B1220", borderWidth: 1, borderColor: "#17212a" },
                  ]}
                  onPress={() => {
                    setEditingRestTime(false);
                    setCustomRestTime(null);
                  }}
                >
                  <Text style={{ color: "#94a3b8", fontWeight: "600" }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {transitioning && <View style={styles.transitionOverlay} pointerEvents="none" />}
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#0F172A" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 14 : 10,
    backgroundColor: "#0B1220",
    borderBottomWidth: 1,
    borderBottomColor: "#121826",
  },

  title: { color: "#22c55e", fontWeight: "700", fontSize: 16 },

  topArea: { 
    padding: 12,
    paddingBottom: 8,
  },

  exercisesProgressContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
  },

  exerciseProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#071025",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#17323a",
  },

  exerciseProgressBarCompleted: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },

  exerciseProgressBarCurrent: {
    backgroundColor: "#0ea5e9",
    borderColor: "#0ea5e9",
  },

  card: {
    backgroundColor: "#0B1220",
    borderRadius: 12,
    padding: 18,
    borderWidth: 1,
    borderColor: "#17212a",
  },

  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  exerciseName: { color: "#E2E8F0", fontSize: 20, fontWeight: "800" },
  seriesInfo: { color: "#94a3b8", marginTop: 6 },

  videoCard: {
    marginTop: 20,
    backgroundColor: "#071025",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#0f1a28",
    alignItems: "center",
  },
  videoThumb: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
  },
  videoBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  videoBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  timerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  timerLabel: { color: "#94a3b8" },
  timerValue: { color: "#22c55e", fontSize: 20, fontWeight: "700" },

  timerSmallLabel: { color: "#94a3b8", fontSize: 12 },
  timerTotal: { color: "#E2E8F0", fontWeight: "700" },

  estimatedLabel: { color: "#94a3b8", fontSize: 12 },
  estimatedValue: { color: "#E2E8F0", fontWeight: "700" },

  restTimeValue: { color: "#22c55e", fontSize: 20, fontWeight: "700" },

  restTimeContainer: {
    alignItems: "center",
  },

  restTimeLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 4,
  },

  controlsRow: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: 12 
  },

  sideBtn: { 
    justifyContent: "center", 
    alignItems: "center" 
  },

  centerControls: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  setsProgressContainer: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },

  setProgressBar: {
    width: 30,
    height: 6,
    backgroundColor: "#071025",
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#17323a",
  },

  setProgressBarCompleted: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },

  setRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#071025",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  setRowDone: { backgroundColor: "#083524" },

  setTitle: { color: "#E2E8F0", fontWeight: "700" },
  setSub: { color: "#94a3b8" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2,6,23,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#0B1220",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#17212a",
  },
  modalTitle: { color: "#E2E8F0", fontWeight: "800", fontSize: 18 },
  modalSub: { color: "#94a3b8", marginTop: 8 },

  modalButton: { backgroundColor: "#22c55e", padding: 12, borderRadius: 8 },

  editSetBtn: {
    padding: 8,
    backgroundColor: "#0B1220",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#17212a",
  },

  editInputContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
    width: "100%",
  },

  editInputGroup: {
    flex: 1,
  },

  editLabel: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },

  editInput: {
    backgroundColor: "#071026",
    borderWidth: 1,
    borderColor: "#17212a",
    borderRadius: 8,
    padding: 12,
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },

  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },

  // Estilos da barra de descanso inline
  restBar: {
    backgroundColor: "#071025",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 2,
    borderColor: "#22c55e",
  },

  restBarContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 12,
  },

  restBarButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0B1220",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#17212a",
  },

  restBarButtonText: {
    color: "#E2E8F0",
    fontSize: 14,
    fontWeight: "700",
  },

  restBarTimerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#0B1220",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#17212a",
    flex: 1,
    justifyContent: "center",
  },

  restBarTimer: {
    color: "#22c55e",
    fontSize: 18,
    fontWeight: "700",
  },

  restBarSkipButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },

  restBarSkipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
