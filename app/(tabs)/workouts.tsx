import AppLayout from '@/components/AppLayout';
import Toast from '@/components/Toast';
import { RoutineContext } from '@/context/RoutineContext';
import { isValidName, sanitizeNumber } from '@/helpers/validators';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function WorkoutsScreen() {
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const router = useRouter();

  const {
    getRoutine,
    addExercise,
    updateExercise,
    addSet,
    updateSet,
    removeExercise,
    removeSet,
    toggleSetCompletion
  } = useContext(RoutineContext);

  const routine = useMemo(
    () => (routineId ? getRoutine(routineId) : undefined),
    [routineId, getRoutine]
  );

  const [newExercise, setNewExercise] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  if (!routine) {
    return (
      <AppLayout style={styles.container}>
        <Text style={styles.error}>Rotina não encontrada.</Text>
      </AppLayout>
    );
  }

  const handleAddExercise = () => {
    if (!isValidName(newExercise)) {
      showToast('Nome inválido');
      return;
    }

    const result = addExercise(routine.id, newExercise);
    showToast(result.message);

    if (result.success) setNewExercise('');
  };

  return (
    <AppLayout style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={26} color="#94a3b8" />
        </TouchableOpacity>

        <Text style={styles.title}>{routine.name}</Text>

        <View style={{ width: 28 }} />
      </View>

      {/* Conteúdo */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Campo de adicionar exercício */}
        <View style={styles.addRow}>
          <TextInput
            placeholder="Adicionar exercício"
            value={newExercise}
            onChangeText={setNewExercise}
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <TouchableOpacity onPress={handleAddExercise} style={styles.addBtn}>
            <Text style={{ color: '#0F172A', fontWeight: '700' }}>
              Adicionar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Lista de exercícios */}
        {routine.exercises.map((ex) => (
          <View key={ex.id} style={styles.exerciseCard}>
            {/* Header do exercício */}
            <View style={styles.rowTop}>
              <Text style={styles.exerciseTitle}>{ex.name}</Text>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => addSet(routine.id, ex.id)}>
                  <Ionicons name="add-circle" size={22} color="#22C55E" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => removeExercise(routine.id, ex.id)}>
                  <Ionicons name="trash-outline" size={22} color="#f43f5e" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sets */}
            {ex.sets.map((s, idx) => (
              <View key={s.id} style={styles.setRow}>
                <TouchableOpacity
                  onPress={() => toggleSetCompletion(routine.id, ex.id, s.id)}
                >
                  <Ionicons
                    name={s.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={s.isCompleted ? '#22C55E' : '#94a3b8'}
                  />
                </TouchableOpacity>

                <Text style={styles.setIndex}>{idx + 1}</Text>

                <TextInput
                  defaultValue={String(s.weight || '')}
                  onEndEditing={(e) =>
                    updateSet(
                      routine.id,
                      ex.id,
                      s.id,
                      s.reps,
                      sanitizeNumber(e.nativeEvent.text, 0)
                    )
                  }
                  style={styles.smallInput}
                />

                <TextInput
                  defaultValue={String(s.reps || '')}
                  onEndEditing={(e) =>
                    updateSet(
                      routine.id,
                      ex.id,
                      s.id,
                      sanitizeNumber(e.nativeEvent.text, 0),
                      s.weight
                    )
                  }
                  style={styles.smallInput}
                />

                <TouchableOpacity onPress={() => removeSet(routine.id, ex.id, s.id)}>
                  <Ionicons name="remove-circle-outline" size={22} color="#94a3b8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      <Toast visible={toastVisible} message={toastMessage} />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#0F172A' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0B1220',
  },

  title: {
    color: '#22C55E',
    fontWeight: '700',
    fontSize: 16,
  },

  content: { padding: 12 },

  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },

  input: {
    flex: 1,
    backgroundColor: '#071025',
    color: '#E6E6E6',
    padding: 12,
    borderRadius: 8,
  },

  addBtn: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
  },

  exerciseCard: {
    backgroundColor: '#071025',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  exerciseTitle: { color: '#E2E8F0', fontWeight: '700', fontSize: 16 },

  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  setIndex: { color: '#94a3b8', width: 28, textAlign: 'center' },

  smallInput: {
    width: 70,
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    padding: 8,
    borderRadius: 6,
    textAlign: 'center',
  },

  error: { padding: 20, color: '#F43F5E' },
});
