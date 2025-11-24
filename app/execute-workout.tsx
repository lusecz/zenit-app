// /app/execute-workout.tsx
import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  StatusBar,
  Platform,
  Modal,
  Alert,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";

import { RoutineContext } from "@/context/RoutineContext";
import { WorkoutHistoryContext } from "@/context/WorkoutHistoryContext";
// importa sua biblioteca de exercícios (pode ser .ts ou .json)
import { EXERCISE_LIBRARY } from "@/data/exercise-library";


/*
  ExecuteWorkoutScreen - final com botão YouTube integrado.

  Observações:
  - EXERCISE_LIBRARY deve exportar um objeto/array com os exercícios
    e cada exercício idealmente possuir `id`, `name` e `youtube` (url).
  - Se não houver vídeo para determinado exercício, será aberta uma busca no YouTube.
*/

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
  // opcional:
  youtube?: string;
};

function useAnimatedValue(initial = 0) {
  const v = useRef(new Animated.Value(initial)).current;
  return v;
}

export default function ExecuteWorkoutScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();

  // Hooks (sempre chamados)
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

  // Se a rotina foi removida enquanto o usuário está aqui -> redireciona
  useEffect(() => {
    if (!routine) {
      // replace para não deixar rota inválida no histórico
      router.replace("/routines");
    }
  }, [routine, router]);

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <View style={{ padding: 20 }}>
          <Text style={{ color: "#94a3b8" }}>
            Rotina não encontrada. Redirecionando...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Inicializa sessão apenas no mount se não existir
  useEffect(() => {
    if (!currentSession) {
      startWorkoutSession(routine.id, routine.name, routine.exercises);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Snapshot fallback
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
        sets: (ex.sets ?? []).map((s: any) => ({ ...s, isCompleted: false })),
        youtube: ex.youtube,
      })),
    };
  }, [currentSession, routine]);

  // Estado local de exercícios (copiado da session)
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

  // Mantém sync se session mudar
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

  // Timer por série/exercício
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  // Timer TOTAL (nunca para automaticamente quando troca de exercício)
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [totalRunning, setTotalRunning] = useState(false);
  const totalTimerRef = useRef<number | null>(null);
  const tickRef = useRef<number | null>(null);

  // Modal descanso
  const [restModalVisible, setRestModalVisible] = useState(false);
  const [restCountdown, setRestCountdown] = useState(0);

  // Transition overlay (small)
  const [transitioning, setTransitioning] = useState(false);

  // Animações
  const progAnim = useAnimatedValue(0);
  const fadeAnim = useAnimatedValue(1);
  const translateY = useAnimatedValue(0);

  // TIMER GLOBAL (total)
  useEffect(() => {
    if (totalRunning) {
      if (totalTimerRef.current == null) {
        totalTimerRef.current = global.setInterval(() => {
          setTotalSeconds((s) => s + 1);
        }, 1000) as unknown as number;
      }
    } else {
      if (totalTimerRef.current != null) {
        clearInterval(totalTimerRef.current);
        totalTimerRef.current = null;
      }
    }
    return () => {
      if (totalTimerRef.current != null) {
        clearInterval(totalTimerRef.current);
        totalTimerRef.current = null;
      }
    };
  }, [totalRunning]);

  // TIMER LOCAL (por série)
  useEffect(() => {
    if (!running) {
      if (tickRef.current != null) {
        clearInterval(tickRef.current as unknown as number);
        tickRef.current = null;
      }
      return;
    }
    tickRef.current = global.setInterval(() => setSeconds((s) => s + 1), 1000) as unknown as number;
    return () => {
      if (tickRef.current != null) {
        clearInterval(tickRef.current as unknown as number);
        tickRef.current = null;
      }
    };
  }, [running]);

  // Atualiza barra de progresso conforme restTime do exercício atual
  useEffect(() => {
    const cur = exercises[exerciseIndex];
    if (!cur) return;
    const total = Math.max(1, cur.restTime);
    Animated.timing(progAnim, {
      toValue: Math.min(seconds / total, 1),
      duration: 160,
      useNativeDriver: false,
      easing: Easing.out(Easing.quad),
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, exerciseIndex]);

  // Formatadores
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

  // Persiste estado no contexto
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
    } catch {
      /* ignora se contexto não estiver pronto */
    }
  };

  // Busca o vídeo no EXERCISE_LIBRARY (procura por id, depois por name)
  const findVideoUrlForExercise = (exercise: ExerciseLocal) => {
    // EXERCISE_LIBRARY pode ter várias formas: object com grupos, array, etc.
    try {
      // Se é um objeto de grupos: { Peito: [..], Costas: [..] }
      if (typeof EXERCISE_LIBRARY === "object" && !Array.isArray(EXERCISE_LIBRARY)) {
        for (const groupKey of Object.keys(EXERCISE_LIBRARY)) {
          const list = (EXERCISE_LIBRARY as any)[groupKey];
          if (!Array.isArray(list)) continue;
          const found = list.find(
            (ex: any) => (ex.id && ex.id === exercise.id) || (ex.name && ex.name === exercise.name)
          );
          if (found && found.youtube) return found.youtube;
        }
      }

      // Se for um array
      if (Array.isArray(EXERCISE_LIBRARY)) {
        const found = EXERCISE_LIBRARY.find(
          (ex: any) => (ex.id && ex.id === exercise.id) || (ex.name && ex.name === exercise.name)
        );
        if (found && found.youtube) return found.youtube;
      }
    } catch (err) {
      // nada
    }

    // fallback: se o próprio exercício tem youtube
    if ((exercise as any).youtube) return (exercise as any).youtube;

    // último recurso: retorna URL de busca no YouTube pelo nome
    const query = encodeURIComponent(exercise.name || "");
    return `https://www.youtube.com/results?search_query=${query}`;
  };

  // Marca/Desmarca série como concluída
  const toggleSetComplete = (setIndex: number) => {
    const cloned = exercises.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) }));
    const target = cloned[exerciseIndex];
    if (!target) return;

    target.sets[setIndex].isCompleted = !target.sets[setIndex].isCompleted;

    // Ao marcar, inicia timers (local e global)
    if (target.sets[setIndex].isCompleted) {
      if (!totalRunning) setTotalRunning(true);
      setRunning(true);
      setSeconds(0);
    }

    persistExerciseState(cloned);

    const allDone = target.sets.every((s) => !!s.isCompleted);
    if (allDone) {
      const rest = target.restTime ?? 60;
      if (rest <= 0) {
        nextExerciseWithAnimation();
        return;
      }
      setRestCountdown(rest);
      setRestModalVisible(true);
      setRunning(false);
    }
  };

  // Modal de descanso countdown
  useEffect(() => {
    if (!restModalVisible) return;
    if (restCountdown <= 0) {
      setRestModalVisible(false);
      nextExerciseWithAnimation();
      return;
    }
    const id = setInterval(() => {
      setRestCountdown((c) => (c <= 1 ? 0 : c - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [restModalVisible, restCountdown]);

  // Troca para próximo exercício com animação
  const nextExerciseWithAnimation = () => {
    const next = exerciseIndex + 1;
    if (next >= exercises.length) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 12, duration: 220, useNativeDriver: true }),
      ]).start(() => {
        try {
          finishWorkoutSession();
        } catch {}
        // redireciona para a tela de resultado (você pode passar params se quiser)
        router.replace("/result");
      });
      return;
    }

    setTransitioning(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 12, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      setExerciseIndex(next);
      setSeconds(0);
      setRunning(false);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 260, useNativeDriver: true }),
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
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start(() => setTransitioning(false));
    });
  };

  // Start/Pause principal (ativa total timer se necessário)
  const toggleRunning = () => {
    if (!totalRunning) setTotalRunning(true);
    setRunning((r) => !r);
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

  // Abre video: usa library se houver, senão usa busca no YouTube
  const openExerciseVideo = async (exercise: ExerciseLocal) => {
    try {
      const url = findVideoUrlForExercise(exercise);
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Erro", "Não foi possível abrir o link do vídeo.");
        return;
      }
      await Linking.openURL(url);
    } catch (err) {
      Alert.alert("Erro", "Não foi possível abrir o vídeo.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/routines")}>
          <Ionicons name="arrow-back-circle" size={26} color="#94a3b8" />
        </TouchableOpacity>

        <Text style={styles.title}>{routine.name}</Text>

        {/* Ícone do YouTube fica no header: abre vídeo do exercício atual */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (!currentExercise) return;
              openExerciseVideo(currentExercise);
            }}
            style={{ padding: 6 }}
            accessibilityLabel="Abrir vídeo do exercício"
          >
            <Ionicons name="logo-youtube" size={22} color="#ef4444" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { /* fullscreen placeholder */ }}>
            <Ionicons name="expand" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Dots + Progress */}
      <View style={styles.topArea}>
        <View style={styles.dotsRow}>
          {exercises.map((_, i) => (
            <View key={i} style={[styles.dot, i === exerciseIndex ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>

        <View style={styles.progressBarBackground}>
          <Animated.View
            style={[
              styles.progressBarFill,
              {
                width: progAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
              },
            ]}
          />
        </View>
      </View>

      {/* CONTEÚDO */}
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View>
                <Text style={styles.exerciseName}>{currentExercise?.name ?? "—"}</Text>
                <Text style={styles.seriesInfo}>
                  Série {(currentExercise?.sets.filter((s) => s.isCompleted).length ?? 0) + 1} / {currentExercise?.sets.length ?? 0}
                </Text>
              </View>

              <View style={{ alignItems: "flex-end" }}>
                <Text style={styles.timerSmallLabel}>Tempo total</Text>
                <Text style={styles.timerTotal}>{formattedTotal}</Text>
              </View>
            </View>

            <View style={styles.timerRow}>
              <View>
                <Text style={styles.timerLabel}>Cronômetro</Text>
                <Text style={styles.timerValue}>{formattedTime}</Text>
              </View>

              <View style={{ alignItems: "center" }}>
                <Text style={styles.estimatedLabel}>Estimativa</Text>
                <Text style={styles.estimatedValue}>{Math.ceil(estimatedTotalTime / 60)} min</Text>
              </View>
            </View>

            {/* Controls */}
            <View style={styles.controlsRow}>
              <TouchableOpacity style={styles.sideBtn} onPress={prevExercise}>
                <Ionicons name="chevron-back-circle-outline" size={40} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.startBtn} onPress={toggleRunning}>
                <Ionicons name={running ? "pause" : "play"} size={22} color="#0F172A" />
                <Text style={styles.startTxt}>{running ? "Pausar" : "Start"}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.sideBtn} onPress={nextExerciseWithAnimation}>
                <Ionicons name="chevron-forward-circle-outline" size={40} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Séries */}
            <View style={{ marginTop: 14 }}>
              {currentExercise?.sets?.map((set, idx) => (
                <TouchableOpacity key={set.id} style={[styles.setRow, set.isCompleted && styles.setRowDone]} onPress={() => toggleSetComplete(idx)}>
                  <View>
                    <Text style={styles.setTitle}>Série {idx + 1}</Text>
                    <Text style={styles.setSub}>{set.reps ?? 0} reps • {set.weight ?? 0} kg</Text>
                  </View>

                  {set.isCompleted ? (
                    <Ionicons name="checkmark-circle" size={28} color="#22c55e" />
                  ) : (
                    <Ionicons name="ellipse-outline" size={26} color="#64748b" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Modal de Descanso */}
      <Modal visible={restModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Descanso</Text>
            <Text style={styles.modalSub}>Próximo exercício em {restCountdown}s</Text>

            <View style={{ flexDirection: "row", gap: 12, marginTop: 12 }}>
              <TouchableOpacity style={styles.modalButton} onPress={() => { setRestModalVisible(false); nextExerciseWithAnimation(); }}>
                <Text style={{ color: "#fff" }}>Pular</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.modalButton, { backgroundColor: "#0B1220", borderWidth: 1, borderColor: "#17212a" }]} onPress={() => { setRestModalVisible(false); setRunning(false); }}>
                <Text style={{ color: "#22c55e" }}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {transitioning && <View style={styles.transitionOverlay} pointerEvents="none" />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  notFound: { color: "#fff", padding: 16, textAlign: "center" },

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

  topArea: { padding: 12 },

  dotsRow: { flexDirection: "row", gap: 8, marginBottom: 8 },
  dot: { width: 10, height: 10, borderRadius: 10 },
  dotActive: { backgroundColor: "#22c55e" },
  dotInactive: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#17323a" },

  progressBarBackground: {
    height: 6,
    backgroundColor: "#071025",
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: { height: 6, backgroundColor: "#22c55e" },

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

  timerRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  timerLabel: { color: "#94a3b8" },
  timerValue: { color: "#22c55e", fontSize: 28, fontWeight: "800" },

  timerSmallLabel: { color: "#94a3b8", fontSize: 12 },
  timerTotal: { color: "#E2E8F0", fontWeight: "700" },

  estimatedLabel: { color: "#94a3b8", fontSize: 12 },
  estimatedValue: { color: "#E2E8F0", fontWeight: "700" },

  controlsRow: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 12 },

  startBtn: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  startTxt: { color: "#0F172A", fontWeight: "700" },

  sideBtn: { justifyContent: "center", alignItems: "center" },

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

  modalOverlay: { flex: 1, backgroundColor: "rgba(2,6,23,0.6)", justifyContent: "center", alignItems: "center" },
  modalBox: { width: "85%", backgroundColor: "#0B1220", borderRadius: 12, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#17212a" },
  modalTitle: { color: "#E2E8F0", fontWeight: "800", fontSize: 18 },
  modalSub: { color: "#94a3b8", marginTop: 8 },

  modalButton: { backgroundColor: "#22c55e", padding: 12, borderRadius: 8 },

  transitionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
});
