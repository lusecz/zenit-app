// app/execute-workout.tsx
// Animated Execute Workout screen (fixed SharedValue usage + UX improvements)
// Requires: react-native-reanimated v2+, expo-av, expo-haptics
// Add sound files in: assets/sounds/start.wav end.wav alert.wav (or adjust paths)

import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { RoutineContext } from '@/context/RoutineContext';
import Toast from '@/components/Toast';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  withTiming,
  runOnJS,
  SharedValue,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

type ExerciseType = {
  id: string;
  name: string;
  restTime?: number;
  sets: { id: string; reps: number; weight: number; isCompleted?: boolean }[];
};

export default function ExecuteWorkoutScreen() {
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const router = useRouter();
  const { getRoutine, toggleSetCompletion, updateSet } = useContext(RoutineContext);

  const routine = useMemo(() => (routineId ? getRoutine(routineId) : undefined), [routineId, getRoutine]);

  // Shared values declared ONCE at top-level of component
  const scrollX = useSharedValue(0);
  // popActiveId: id of set currently popping; popProgress: 0..1 progress
  const popActiveId = useSharedValue<string | null>(null);
  const popProgress = useSharedValue(0);

  const scrollRef = useRef<Animated.ScrollView | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const restTimerRef = useRef<any>(null);
  const [restVisible, setRestVisible] = useState(false);
  const [restSeconds, setRestSeconds] = useState(0);
  const finishingRef = useRef(false);

  // sounds
  const soundStart = useRef<Audio.Sound | null>(null);
  const soundEnd = useRef<Audio.Sound | null>(null);
  const soundAlert = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // load sounds if present; if not, catch silently
        const start = await Audio.Sound.createAsync(require('../assets/sounds/start.wav')).catch(() => null);
        if (start && mounted) soundStart.current = start.sound;

        const end = await Audio.Sound.createAsync(require('../assets/sounds/end.wav')).catch(() => null);
        if (end && mounted) soundEnd.current = end.sound;

        const alert = await Audio.Sound.createAsync(require('../assets/sounds/alert.wav')).catch(() => null);
        if (alert && mounted) soundAlert.current = alert.sound;
      } catch (e) {
        console.warn('Failed to load one or more sounds', e);
      }
    })();

    return () => {
      mounted = false;
      [soundStart.current, soundEnd.current, soundAlert.current].forEach((s) => {
        if (s) s.unloadAsync().catch(() => {});
      });
      if (restTimerRef.current) clearInterval(restTimerRef.current);
    };
  }, []);

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Rotina não encontrada.</Text>
      </SafeAreaView>
    );
  }

  const exercises = routine.exercises as ExerciseType[];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollX.value = event.contentOffset.x;
  });

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, exercises.length - 1));
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
    setCurrentIndex(clamped);
  };

  const playSound = async (which: 'start' | 'end' | 'alert') => {
    try {
      if (which === 'start' && soundStart.current) await soundStart.current.replayAsync();
      if (which === 'end' && soundEnd.current) await soundEnd.current.replayAsync();
      if (which === 'alert' && soundAlert.current) await soundAlert.current.replayAsync();
    } catch {
      // ignore audio errors
    }
  };

  const startRest = (seconds: number, exerciseName?: string, autoAdvance = true) => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    setRestSeconds(seconds);
    setRestVisible(true);

    restTimerRef.current = setInterval(() => {
      setRestSeconds((p) => {
        if (p <= 1) {
          clearInterval(restTimerRef.current);
          restTimerRef.current = null;
          setRestVisible(false);

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          playSound('end');
          showToast(`Descanso finalizado${exerciseName ? ` — ${exerciseName}` : ''}`);

          if (autoAdvance) runOnJS(handleAdvanceAfterRest)();
          return 0;
        }
        return p - 1;
      });
    }, 1000);
  };

  const cancelRest = () => {
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    restTimerRef.current = null;
    setRestVisible(false);
    setRestSeconds(0);
  };

  const handleAdvanceAfterRest = () => {
    const exIndex = currentIndex;
    if (exIndex < exercises.length - 1) scrollTo(exIndex + 1);
    else if (!finishingRef.current) {
      finishingRef.current = true;
      showToast('Parabéns — Treino finalizado!');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      playSound('end');
    }
  };

  // trigger pop: set active id + animate progress
  const triggerSetPop = (setId: string) => {
    popActiveId.value = setId;
    // set to 1 then animate to 0; withTiming returns immediately, but that's fine
    popProgress.value = withTiming(1, { duration: 160 }, () => {
      popProgress.value = withTiming(0, { duration: 220 });
    });
  };

  const onToggleSet = (exerciseId: string, setId: string) => {
    // toggle in context (persistence)
    toggleSetCompletion(routine.id, exerciseId, setId);

    // feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    playSound('start');
    triggerSetPop(setId);

    const ex = exercises.find((e) => e.id === exerciseId);
    if (!ex) return;
    const setObj = ex.sets.find((s) => s.id === setId);
    if (!setObj) return;

    const nowCompleted = !setObj.isCompleted; // because toggled
    if (nowCompleted && ex.restTime && ex.restTime > 0) {
      startRest(ex.restTime, ex.name, true);
    }
  };

  const onUpdateSet = (exerciseId: string, setId: string, reps: number | string, weight: number | string) => {
    const safeReps = Number(reps) || 0;
    const safeWeight = Number(weight) || 0;
    updateSet(routine.id, exerciseId, setId, safeReps, safeWeight);
  };

  // components local to file for readability
  function SetRow({ ex, s, idx }: { ex: ExerciseType; s: ExerciseType['sets'][0]; idx: number }) {
    const animStyle = useAnimatedStyle(() => {
      const isActive = popActiveId.value === s.id;
      const progress = popProgress.value;
      const scale = isActive ? interpolate(progress, [0, 1], [1, 1.12], Extrapolate.CLAMP) : 1;
      return { transform: [{ scale }] as any };
    });

    return (
      <View style={styles.setRow}>
        <TouchableOpacity onPress={() => onToggleSet(ex.id, s.id)} style={styles.checkButton}>
          <Animated.View style={animStyle as any}>
            <Ionicons name={s.isCompleted ? 'checkmark-circle' : 'ellipse-outline'} size={30} color={s.isCompleted ? '#22C55E' : '#94a3b8'} />
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.setLabel}>{idx + 1}</Text>

        <TextInput
          keyboardType="numeric"
          defaultValue={String(s.weight ?? '')}
          onEndEditing={(e) => onUpdateSet(ex.id, s.id, s.reps, Number(e.nativeEvent.text || 0))}
          style={styles.setInput}
          placeholder="Kg"
          placeholderTextColor="#475569"
        />

        <TextInput
          keyboardType="numeric"
          defaultValue={String(s.reps ?? '')}
          onEndEditing={(e) => onUpdateSet(ex.id, s.id, Number(e.nativeEvent.text || 0), s.weight)}
          style={styles.setInput}
          placeholder="Reps"
          placeholderTextColor="#475569"
        />
      </View>
    );
  }

  function ExerciseCard({ ex, i }: { ex: ExerciseType; i: number }) {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];

    const titleStyle = useAnimatedStyle(() => {
      const translate = interpolate(scrollX.value, inputRange, [-24, 0, 24], Extrapolate.CLAMP);
      const opacity = interpolate(scrollX.value, inputRange, [0.7, 1, 0.7], Extrapolate.CLAMP);
      return {
        transform: [{ translateX: translate } as any],
        opacity,
      };
    });

    return (
      <View key={ex.id} style={[styles.card, { width }]}>
        <Animated.View style={[styles.titleWrap, titleStyle]}>
          <Text style={styles.exerciseName}>{i + 1}. {ex.name}</Text>
          <Text style={styles.subText}>Descanso: {ex.restTime ?? 60}s • Séries: {ex.sets.length}</Text>
        </Animated.View>

        <View style={styles.setsContainer}>
          {ex.sets.map((s, idx) => <SetRow key={s.id} ex={ex} s={s} idx={idx} />)}
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity onPress={() => scrollTo(Math.max(i - 1, 0))} style={styles.navBtn}>
            <Ionicons name="chevron-back-circle" size={36} color="#94a3b8" />
          </TouchableOpacity>

          <Text style={styles.progressText}>{i + 1} / {exercises.length}</Text>

          <TouchableOpacity onPress={() => scrollTo(Math.min(i + 1, exercises.length - 1))} style={styles.navBtn}>
            <Ionicons name="chevron-forward-circle" size={36} color="#22C55E" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // progress bar style
  const progressBarStyle = useAnimatedStyle(() => {
    const progress = interpolate(scrollX.value, [0, (exercises.length - 1) * width], [0, 1], Extrapolate.CLAMP);
    return { transform: [{ scaleX: progress < 0 ? 0 : progress }], opacity: 1 };
  });

  // dots data
  const Dot = ({ index }: { index: number }) => {
    const style = useAnimatedStyle(() => {
      const px = scrollX.value / width;
      const dist = Math.abs(px - index);
      const scale = interpolate(dist, [0, 1], [1.2, 0.9], Extrapolate.CLAMP);
      const opacity = interpolate(dist, [0, 1], [1, 0.5], Extrapolate.CLAMP);
      return { transform: [{ scale }], opacity };
    });
    return <Animated.View style={[styles.dot, style]} />;
  };

  // fullscreen toggle
  const [fullscreen, setFullscreen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {!fullscreen && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={22} color="#94a3b8" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>{routine.name}</Text>

          <TouchableOpacity onPress={() => setFullscreen((s) => !s)} style={styles.headerBtn}>
            <Ionicons name={fullscreen ? 'contract' : 'expand'} size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      )}

      {/* animated progress bar */}
      <View style={styles.progressWrap}>
        <Animated.View style={[styles.progressFill, progressBarStyle]} />
      </View>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
      >
        {exercises.map((ex, i) => <ExerciseCard key={ex.id} ex={ex} i={i} />)}
      </Animated.ScrollView>

      {/* dots indicator */}
      {!fullscreen && (
        <View style={styles.dotsRow}>
          {exercises.map((_, idx) => <Dot key={idx} index={idx} />)}
        </View>
      )}

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
                handleAdvanceAfterRest();
              }}
            >
              <Text style={styles.skipText}>Pular descanso</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* footer control only when not fullscreen */}
      {!fullscreen && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.finishBtn} onPress={() => {
            cancelRest();
            showToast('Treino finalizado manualmente');
            router.back();
          }}>
            <Text style={styles.finishText}>Finalizar treino</Text>
          </TouchableOpacity>
        </View>
      )}

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#0B1220' },
  headerBtn: { padding: 6 },
  headerTitle: { color: '#22C55E', fontWeight: '700', fontSize: 18 },

  progressWrap: { height: 6, backgroundColor: '#071025', marginHorizontal: 18, borderRadius: 6, overflow: 'hidden', marginTop: 8 },
  progressFill: { height: 6, backgroundColor: '#22C55E', width: '100%', transform: [{ scaleX: 0 }], alignSelf: 'flex-start' },

  card: { padding: 18, height: '100%' },
  titleWrap: { marginBottom: 12 },
  exerciseName: { color: '#E2E8F0', fontSize: 20, fontWeight: '700' },
  subText: { color: '#94A3B8', fontSize: 13 },

  setsContainer: { marginTop: 8 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#0B1220' },
  checkButton: { paddingRight: 6 },
  setLabel: { width: 36, color: '#94a3b8', textAlign: 'center' },
  setInput: { width: 88, backgroundColor: '#071025', color: '#E2E8F0', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginRight: 8, textAlign: 'center' },

  cardFooter: { position: 'absolute', bottom: 28, left: 18, right: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: { padding: 8 },
  progressText: { color: '#94a3b8' },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingVertical: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22C55E', marginHorizontal: 6 },

  restOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(2,6,23,0.6)' },
  restBox: { width: '84%', backgroundColor: '#071025', padding: 22, borderRadius: 12, alignItems: 'center' },
  restTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  restCounter: { color: '#22C55E', fontSize: 36, fontWeight: '800', marginBottom: 12 },
  skipBtn: { backgroundColor: '#0B1220', paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  skipText: { color: '#E2E8F0', fontWeight: '600' },

  footer: { padding: 12, alignItems: 'center', justifyContent: 'center' },
  finishBtn: { backgroundColor: '#22C55E', paddingHorizontal: 36, paddingVertical: 12, borderRadius: 12 },
  finishText: { color: '#071025', fontWeight: '700' },

  errorText: { color: '#F43F5E', padding: 16 },
});
