// app/(tabs)/execute-workout.tsx
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Vibration,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RoutineContext } from '@/context/RoutineContext';
import Toast from '@/components/Toast';
import { Ionicons } from '@expo/vector-icons';
import { sanitizeNumber } from '@/helpers/validators';

const { width } = Dimensions.get('window');

export default function ExecuteWorkoutScreen() {
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const router = useRouter();
  const { getRoutine, toggleSetCompletion, updateSet } = useContext(RoutineContext);

  const routine = useMemo(() => (routineId ? getRoutine(routineId) : undefined), [routineId, getRoutine]);

  const scrollRef = useRef<ScrollView | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // index of exercise card shown
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Rest timer state
  const [restVisible, setRestVisible] = useState(false);
  const restTimerRef = useRef<NodeJS.Timeout | number | null>(null);
  const [restSeconds, setRestSeconds] = useState<number>(0);

  // hold session local copies so UI is responsive (we will still toggle via context for persistence)
  // But we'll read from context each render (routine.exercises), so no separate local mirror needed.

  useEffect(() => {
    // cleanup timer on unmount
    return () => {
      if (restTimerRef.current) {
        // @ts-ignore
        clearInterval(restTimerRef.current);
      }
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Rotina não encontrada.</Text>
      </SafeAreaView>
    );
  }

  const exercises = routine.exercises || [];

  const scrollToIndex = (index: number) => {
    const x = Math.max(0, Math.min(index, exercises.length - 1)) * width;
    scrollRef.current?.scrollTo({ x, animated: true });
    setCurrentCardIndex(index);
  };

  const goNextCard = () => {
    const next = Math.min(currentCardIndex + 1, exercises.length - 1);
    scrollToIndex(next);
  };

  const goPrevCard = () => {
    const prev = Math.max(currentCardIndex - 1, 0);
    scrollToIndex(prev);
  };

  const onToggleSet = async (exerciseId: string, setId: string) => {
    // Find exercise & set to determine restTime
    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;

    const setObj = ex.sets.find((s) => s.id === setId);
    if (!setObj) return;

    const wasCompleted = !!setObj.isCompleted;

    // Toggle in context
    toggleSetCompletion(routine.id, exerciseId, setId);

    // If marking completed (was false -> now true), start rest timer
    if (!wasCompleted && ex.restTime && ex.restTime > 0) {
      startRest(ex.name, ex.restTime, exerciseId, setId);
    } else if (wasCompleted) {
      // If it was completed and user unmarks, cancel any running rest timer
      cancelRest();
      showToast('Série desmarcada');
    }
  };

  const startRest = (exerciseName: string, seconds: number, exerciseId?: string, setId?: string) => {
    cancelRest();
    const sec = Math.max(0, Math.floor(isNaN(seconds) ? 0 : seconds));
    setRestSeconds(sec);
    setRestVisible(true);

    // interval tick every 1s
    // Using setInterval to allow countdown
    // store id to ref for cancellation
    restTimerRef.current = setInterval(() => {
      setRestSeconds((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          // finish
          cancelRest();
          Vibration.vibrate(400);
          showToast(`Descanso finalizado para ${exerciseName}`);
          // advance to next set/exercise
          advanceAfterRest(exerciseId!, setId!);
          return 0;
        }
        return next;
      });
    }, 1000);
  };

  const cancelRest = () => {
    if (restTimerRef.current) {
      // @ts-ignore
      clearInterval(restTimerRef.current);
      restTimerRef.current = null;
    }
    setRestVisible(false);
    setRestSeconds(0);
  };

  const advanceAfterRest = (exerciseId: string, setId: string) => {
    // Try to focus next set in the same exercise; if last set, go to next exercise
    const exIndex = exercises.findIndex((e) => e.id === exerciseId);
    if (exIndex === -1) return;

    const ex = exercises[exIndex];
    const setIndex = ex.sets.findIndex((s) => s.id === setId);
    // if there is a next set in same exercise -> do nothing (user can mark)
    if (setIndex < ex.sets.length - 1) {
      // Optionally you may auto-scroll down inside card; we won't change vertical content
      return;
    }

    // else go to next exercise card
    if (exIndex < exercises.length - 1) {
      scrollToIndex(exIndex + 1);
    } else {
      // finished all exercises
      showToast('Parabéns — Treino finalizado!');
    }
  };

  const onUpdateSetNumber = (exerciseId: string, setId: string, reps: number | string, weight: number | string) => {
    const safeReps = sanitizeNumber(reps, 0);
    const safeWeight = sanitizeNumber(weight, 0);
    updateSet(routine.id, exerciseId, setId, safeReps, safeWeight);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color="#94a3b8" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{routine.name}</Text>

        <View style={{ width: 36 }} />
      </View>

      {/* Scroll horizontal cards */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{}}
        onMomentumScrollEnd={(ev) => {
          const px = ev.nativeEvent.contentOffset.x;
          const idx = Math.round(px / width);
          setCurrentCardIndex(idx);
        }}
      >
        {exercises.map((ex, exIndex) => (
          <View key={ex.id} style={[styles.card, { width }]}>
            <Text style={styles.exerciseName}>
              {exIndex + 1}. {ex.name}
            </Text>

            <View style={styles.cardSub}>
              <Text style={styles.subText}>Descanso padrão: {ex.restTime ?? 60}s</Text>
              <Text style={styles.subText}>
                Séries: {ex.sets.length} • Concluídas: {ex.sets.filter((s) => s.isCompleted).length}
              </Text>
            </View>

            <View style={styles.setsContainer}>
              {ex.sets.map((s, idx) => (
                <View key={s.id} style={styles.setRow}>
                  <TouchableOpacity
                    onPress={() => onToggleSet(ex.id, s.id)}
                    style={styles.checkButton}
                  >
                    <Ionicons
                      name={s.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                      size={26}
                      color={s.isCompleted ? '#22C55E' : '#94a3b8'}
                    />
                  </TouchableOpacity>

                  <Text style={styles.setLabel}>{idx + 1}</Text>

                  <TextInput
                    keyboardType="numeric"
                    defaultValue={String(s.weight ?? '')}
                    onEndEditing={(e) =>
                      onUpdateSetNumber(ex.id, s.id, s.reps, sanitizeNumber(e.nativeEvent.text, 0))
                    }
                    style={styles.setInput}
                    placeholder="Kg"
                    placeholderTextColor="#475569"
                  />

                  <TextInput
                    keyboardType="numeric"
                    defaultValue={String(s.reps ?? '')}
                    onEndEditing={(e) =>
                      onUpdateSetNumber(
                        ex.id,
                        s.id,
                        sanitizeNumber(e.nativeEvent.text, 0),
                        s.weight
                      )
                    }
                    style={styles.setInput}
                    placeholder="Reps"
                    placeholderTextColor="#475569"
                  />
                </View>
              ))}
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity onPress={goPrevCard} style={styles.navBtn}>
                <Ionicons name="chevron-back-circle" size={36} color="#94a3b8" />
              </TouchableOpacity>

              <Text style={styles.progressText}>
                {exIndex + 1} / {exercises.length}
              </Text>

              <TouchableOpacity onPress={goNextCard} style={styles.navBtn}>
                <Ionicons name="chevron-forward-circle" size={36} color="#22C55E" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Rest overlay */}
      {restVisible && (
        <View style={styles.restOverlay}>
          <View style={styles.restBox}>
            <Text style={styles.restTitle}>Descanso</Text>
            <Text style={styles.restCounter}>{restSeconds}s</Text>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => {
                cancelRest();
                showToast('Descanso pulado');
                // Optionally advance to next card
                goNextCard();
              }}
            >
              <Text style={styles.skipText}>Pular descanso</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Toast */}
      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 0,
    backgroundColor: '#0B1220',
  },
  headerBtn: { padding: 6 },
  headerTitle: { color: '#22C55E', fontWeight: '700', fontSize: 18 },

  card: {
    padding: 18,
    height: '100%',
  },

  exerciseName: { color: '#E2E8F0', fontSize: 20, fontWeight: '700', marginBottom: 12 },

  cardSub: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  subText: { color: '#94A3B8', fontSize: 13 },

  setsContainer: { marginTop: 8 },

  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0B1220',
  },
  checkButton: { paddingRight: 6 },
  setLabel: { width: 36, color: '#94a3b8', textAlign: 'center' },

  setInput: {
    width: 88,
    backgroundColor: '#071025',
    color: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    textAlign: 'center',
  },

  cardFooter: {
    position: 'absolute',
    bottom: 28,
    left: 18,
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  navBtn: { padding: 8 },
  progressText: { color: '#94a3b8' },

  // rest overlay
  restOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,23,0.6)',
  },
  restBox: {
    width: '84%',
    backgroundColor: '#071025',
    padding: 22,
    borderRadius: 12,
    alignItems: 'center',
  },
  restTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  restCounter: { color: '#22C55E', fontSize: 36, fontWeight: '800', marginBottom: 12 },
  skipBtn: {
    backgroundColor: '#0B1220',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  skipText: { color: '#E2E8F0', fontWeight: '600' },

  errorText: { color: '#F43F5E', padding: 16 },
});
