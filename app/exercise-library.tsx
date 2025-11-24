import React, { useState, useMemo, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { EXERCISE_LIBRARY_GROUPS } from '@/data/exercise-library-groups';
import { RoutineContext } from '@/context/RoutineContext';
import Toast from '@/components/Toast';

// Helper para criar thumbnails do YouTube
function getYoutubeThumbnail(url: string) {
  try {
    const videoId = url.split('v=')[1].split('&')[0];
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch {
    return null;
  }
}

export default function ExerciseLibraryScreen() {
  const router = useRouter();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();

  const { addExercise } = useContext(RoutineContext);

  const [search, setSearch] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

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
        ex =>
          ex.name.toLowerCase().includes(lower) ||
          ex.muscle.toLowerCase().includes(lower)
      );

      if (matches.length > 0) result[group] = matches;
    });

    return result;
  }, [search]);

  const handleAddExercise = (exerciseName: string) => {
    if (!routineId) {
      showToast('Rotina não encontrada.');
      return;
    }

    const res = addExercise(routineId, exerciseName);
    showToast(res.message);
  };

  return (
    <>
      {/* Remove o header nativo do Expo Router */}
      <Stack.Screen options={{ headerShown: false }} />

      <SafeAreaView style={styles.container}>
        {/* Header custom */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
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

        {/* Lista */}
        <ScrollView contentContainerStyle={{ paddingBottom: 140 }}>
          {Object.entries(filteredGroups).map(([group, exercises]) => (
            <View key={group} style={styles.groupBox}>
              <Text style={styles.groupTitle}>{group}</Text>

              {exercises.map(ex => {
                const thumbnail = getYoutubeThumbnail(ex.youtube);

                return (
                  <View key={ex.id} style={styles.exerciseCard}>
                    <Image
                      source={{ uri: thumbnail || undefined }}
                      style={styles.thumbnail}
                    />

                    <View style={{ flex: 1 }}>
                      <Text style={styles.exerciseName}>{ex.name}</Text>
                      <Text style={styles.exerciseMuscle}>{ex.muscle}</Text>
                    </View>

                    <View style={styles.actions}>
                      <TouchableOpacity
                        onPress={() => Linking.openURL(ex.youtube)}
                        style={styles.iconBtn}
                      >
                        <Ionicons name="logo-youtube" size={26} color="#ef4444" />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleAddExercise(ex.name)}
                        style={styles.iconBtn}
                      >
                        <Ionicons name="add-circle" size={28} color="#22c55e" />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          ))}
        </ScrollView>

        <Toast visible={toastVisible} message={toastMessage} />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#0B1220',
  },

  headerTitle: {
    color: '#22c55e',
    fontSize: 18,
    fontWeight: '700',
  },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: '#071025',
    margin: 14,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
  },

  searchInput: { flex: 1, color: '#E6E6E6' },

  groupBox: { marginBottom: 20, paddingHorizontal: 14 },

  groupTitle: {
    color: '#22c55e',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },

  exerciseCard: {
    backgroundColor: '#0B1220',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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

  iconBtn: { padding: 4 },
});
