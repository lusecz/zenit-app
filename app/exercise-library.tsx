// app/exercise-library.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Image,
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import AppLayout from '@/components/AppLayout';
import Toast from '@/components/Toast';
import { RoutineContext } from '@/context/RoutineContext';
import { EXERCISE_LIBRARY_GROUPS } from '@/data/exercise-library-groups';

// Helper para criar thumbnails do YouTube
function getYoutubeThumbnail(url: string | undefined) {
  if (!url) return null;
  try {
    const videoId = url.split('v=')[1]?.split('&')[0];
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch {
    return null;
  }
}

export default function ExerciseLibraryScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();

  const { addExercise } = React.useContext(RoutineContext);

  const [search, setSearch] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // seleção múltipla
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [groupSelected, setGroupSelected] = useState<Record<string, boolean>>({});

  // animação para botão flutuante
  const floatAnim = useRef(new Animated.Value(0)).current;

  // animação para entrada dos cards
  const animationsRef = useRef<Record<string, Animated.Value>>({}).current;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  // Filtrar grupos pela busca
  const filteredGroups = useMemo(() => {
    if (!search.trim()) return EXERCISE_LIBRARY_GROUPS;

    const lower = search.toLowerCase();
    const result: Record<string, any[]> = {};

    Object.entries(EXERCISE_LIBRARY_GROUPS).forEach(([group, list]) => {
      const matches = list.filter(
        (ex: any) =>
          ex.name.toLowerCase().includes(lower) ||
          ex.muscle.toLowerCase().includes(lower)
      );

      if (matches.length > 0) result[group] = matches;
    });

    return result;
  }, [search]);

  // animação do botão flutuante
  useEffect(() => {
    const anySelected = Object.values(selectedIds).some(Boolean);
    Animated.timing(floatAnim, {
      toValue: anySelected ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [selectedIds, floatAnim]);

  const getAnimFor = (id: string) => {
    if (!animationsRef[id]) animationsRef[id] = new Animated.Value(0);
    return animationsRef[id];
  };

  // animar entrada dos cards
  useEffect(() => {
    const ids: string[] = [];
    Object.values(filteredGroups).forEach(list => list.forEach((ex: any) => ids.push(ex.id)));
    ids.slice(0, 60).forEach((id, idx) => {
      const anim = getAnimFor(id);
      Animated.timing(anim, {
        toValue: 1,
        duration: 420,
        delay: idx * 20,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    });
  }, [filteredGroups]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleSelectGroup = (group: string, exercises: any[]) => {
    const allSelected = exercises.every((ex: any) => selectedIds[ex.id]);
    const nextSelected = { ...selectedIds };

    exercises.forEach((ex: any) => {
      nextSelected[ex.id] = !allSelected;
    });

    setSelectedIds(nextSelected);
    setGroupSelected(prev => ({ ...prev, [group]: !allSelected }));
  };

  const handleAddExerciseSingle = (exerciseName: string) => {
    if (!routineId) {
      showToast('Rotina não encontrada.');
      return;
    }
    const res = addExercise(routineId, exerciseName);
    showToast(res.message);
  };

  const handleAddSelected = async () => {
    if (!routineId) {
      showToast('Rotina não encontrada.');
      return;
    }
    const ids = Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => k);
    if (ids.length === 0) {
      showToast('Nenhum exercício selecionado.');
      return;
    }

    const allExercises = Object.values(EXERCISE_LIBRARY_GROUPS).flat();
    const toAdd = allExercises.filter((ex: any) => ids.includes(ex.id));

    let added = 0;
    toAdd.forEach(ex => {
      const res = addExercise(routineId, ex.name);
      if (res.success) added++;
    });

    showToast(`Adicionados: ${added} de ${toAdd.length}`);
    setSelectedIds({});
    setGroupSelected({});
  };

  const openYoutube = (url?: string) => {
    if (!url) {
      showToast('Vídeo não disponível.');
      return;
    }
    Linking.openURL(url).catch(() => showToast('Não foi possível abrir o link.'));
  };

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 0],
  });
  const floatOpacity = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <AppLayout style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/(tabs)")}>
        <Ionicons name="arrow-back-circle" size={30} color="#94a3b8" />
        </TouchableOpacity>


        <Text style={styles.headerTitle}>Biblioteca de Exercícios</Text>

        <View style={{ width: 30 }} />
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={18} color="#94a3b8" />
        <TextInput
          placeholder="Buscar exercício..."
          placeholderTextColor="#94a3b8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* LISTA — SEM BARRA LATERAL */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {Object.entries(filteredGroups).map(([group, exercises]) => (
          <View key={group} style={styles.groupBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.groupHeader}
              onPress={() => toggleSelectGroup(group, exercises)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons
                  name={exercises.every((ex: any) => selectedIds[ex.id]) ? 'checkbox' : 'square-outline'}
                  size={20}
                  color="#22c55e"
                />
                <Text style={styles.groupTitle}>{group}</Text>
              </View>

              <Text style={styles.groupCount}>{exercises.length}</Text>
            </TouchableOpacity>

            {exercises.map((ex: any) => {
              const anim = getAnimFor(ex.id);
              const translateY = anim.interpolate({
                inputRange: [0, 1],
                outputRange: [8, 0],
              });

              const thumbnail = getYoutubeThumbnail(ex.youtube);

              return (
                <Animated.View
                  key={ex.id}
                  style={[styles.exerciseCard, { transform: [{ translateY }], opacity: anim }]}
                >
                  <TouchableOpacity onPress={() => toggleSelect(ex.id)} style={styles.selectBtn}>
                    <Ionicons
                      name={selectedIds[ex.id] ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={selectedIds[ex.id] ? '#22c55e' : '#94a3b8'}
                    />
                  </TouchableOpacity>

                  <Image
                    source={thumbnail ? { uri: thumbnail } : undefined}
                    style={styles.thumbnail}
                  />

                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.exerciseName}>{ex.name}</Text>
                    <Text style={styles.exerciseMuscle}>{ex.muscle}</Text>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openYoutube(ex.youtube)} style={styles.iconBtn}>
                      <Ionicons name="logo-youtube" size={26} color="#ef4444" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => handleAddExerciseSingle(ex.name)}
                      style={styles.iconBtn}
                    >
                      <Ionicons name="add-circle" size={28} color="#22c55e" />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {/* Botão flutuante */}
      <Animated.View
        pointerEvents={selectedCount > 0 ? 'auto' : 'none'}
        style={[
          styles.floatingBar,
          {
            transform: [{ translateY: floatTranslate }],
            opacity: floatOpacity,
          },
        ]}
      >
        <Text style={styles.floatingText}>{selectedCount} selecionado(s)</Text>

        <TouchableOpacity style={styles.floatingBtn} onPress={handleAddSelected}>
          <Ionicons name="add" size={18} color="#0F172A" />
          <Text style={styles.floatingBtnText}>Adicionar selecionados</Text>
        </TouchableOpacity>
      </Animated.View>

      <Toast visible={toastVisible} message={toastMessage} />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#071026' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#081426',
    borderBottomWidth: 1,
    borderBottomColor: '#0f1724',
  },

  headerTitle: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '700',
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#081426',
    margin: 14,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0f1a28',
    gap: 10,
  },

  searchInput: {
    flex: 1,
    color: '#E6E6E6',
  },

  listContainer: {
    paddingBottom: 140,
    paddingHorizontal: 14,
  },

  groupBox: {
    marginBottom: 22,
  },

  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  groupTitle: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '700',
  },

  groupCount: {
    color: '#94a3b8',
    fontSize: 12,
  },

  exerciseCard: {
    backgroundColor: '#0b1320',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#0f1a28',
  },

  selectBtn: {
    paddingRight: 6,
  },

  thumbnail: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#0F172A',
  },

  exerciseName: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },

  exerciseMuscle: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconBtn: {
    padding: 4,
  },

  floatingBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 20,
    height: 58,
    borderRadius: 12,
    backgroundColor: '#081426',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#0f1a28',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },

  floatingText: {
    color: '#94a3b8',
    fontSize: 14,
  },

  floatingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#22c55e',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  floatingBtnText: {
    color: '#0F172A',
    fontWeight: '700',
  },
});
