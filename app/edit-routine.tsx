import { RoutineContext } from '@/context/RoutineContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useContext, useMemo, useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditRoutineScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const {
    getRoutine,
    addExercise,
    updateExercise,
    removeExercise,
    updateExerciseRestTime,
    addSet,
    removeSet,
    updateSet,
  } = useContext(RoutineContext);

  const routine = useMemo(() => getRoutine(routineId!), [routineId, getRoutine]);
  const exercises = routine?.exercises || [];

  const [newExerciseName, setNewExerciseName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState('');

  const handleAddExercise = () => {
    if (!routineId || !newExerciseName.trim()) return;
    addExercise(routineId, newExerciseName.trim());
    setNewExerciseName('');
    setModalVisible(false);
  };

  const handleEditExerciseName = (exerciseId: string, currentName: string) => {
    setEditingExerciseId(exerciseId);
    setEditingExerciseName(currentName);
  };

  const handleSaveExerciseName = () => {
    if (!routineId || !editingExerciseId || !editingExerciseName.trim()) return;
    updateExercise(routineId, editingExerciseId, editingExerciseName.trim());
    setEditingExerciseId(null);
    setEditingExerciseName('');
  };

  const handleDeleteExercise = (exerciseId: string, exerciseName: string) => {
    Alert.alert(
      'Deletar Exercício',
      `Tem certeza que deseja deletar "${exerciseName}"? Todas as séries serão perdidas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => routineId && removeExercise(routineId, exerciseId),
        },
      ]
    );
  };

  const handleDeleteSet = (exerciseId: string, setId: string, setNumber: number) => {
    Alert.alert(
      'Deletar Série',
      `Tem certeza que deseja deletar a série ${setNumber}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => routineId && removeSet(routineId, exerciseId, setId),
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.content}>
        {exercises.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="fitness-outline" size={64} color="#64748B" />
            <Text style={styles.emptyText}>Nenhum exercício adicionado</Text>
            <Text style={styles.emptySubtext}>
              Toque no botão abaixo para adicionar exercícios
            </Text>
          </View>
        ) : (
          exercises.map((exercise, exerciseIndex) => (
            <View key={exercise.id} style={styles.exerciseCard}>
              {/* Nome do Exercício */}
              <View style={styles.exerciseHeader}>
                {editingExerciseId === exercise.id ? (
                  <View style={styles.editNameContainer}>
                    <TextInput
                      style={styles.editNameInput}
                      value={editingExerciseName}
                      onChangeText={setEditingExerciseName}
                      autoFocus
                    />
                    <TouchableOpacity onPress={handleSaveExerciseName}>
                      <Ionicons name="checkmark-circle" size={28} color="#22C55E" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setEditingExerciseId(null)}>
                      <Ionicons name="close-circle" size={28} color="#F43F5E" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <TouchableOpacity
                      onPress={() => handleEditExerciseName(exercise.id, exercise.name)}
                      style={styles.exerciseNameContainer}>
                      <Text style={styles.exerciseName}>
                        {exerciseIndex + 1}. {exercise.name}
                      </Text>
                      <Ionicons name="pencil" size={18} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteExercise(exercise.id, exercise.name)}>
                      <Ionicons name="trash-outline" size={24} color="#F43F5E" />
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* Tempo de Descanso */}
              <View style={styles.restTimeContainer}>
                <Ionicons name="time-outline" size={20} color="#64748B" />
                <Text style={styles.restTimeLabel}>Descanso (segundos):</Text>
                <TextInput
                  style={styles.restTimeInput}
                  keyboardType="numeric"
                  defaultValue={exercise.restTime?.toString() || '60'}
                  onEndEditing={(e) => {
                    if (!routineId) return;
                    const newRestTime = parseInt(e.nativeEvent.text) || 60;
                    updateExerciseRestTime(routineId, exercise.id, newRestTime);
                  }}
                />
              </View>

              {/* Cabeçalho das Séries */}
              <View style={styles.setsHeader}>
                <Text style={[styles.setsHeaderText, { flex: 0.8 }]}>SÉRIE</Text>
                <Text style={[styles.setsHeaderText, { flex: 1 }]}>KG</Text>
                <Text style={[styles.setsHeaderText, { flex: 1 }]}>REPS</Text>
                <Text style={[styles.setsHeaderText, { flex: 0.5 }]}></Text>
              </View>

              {/* Séries */}
              {exercise.sets.map((set, setIndex) => (
                <View key={set.id} style={styles.setRow}>
                  <Text style={[styles.setNumber, { flex: 0.8 }]}>{setIndex + 1}</Text>
                  <TextInput
                    style={[styles.setInput, { flex: 1 }]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#475569"
                    defaultValue={set.weight?.toString() || ''}
                    onEndEditing={(e) => {
                      if (!routineId) return;
                      const weight = parseFloat(e.nativeEvent.text) || 0;
                      updateSet(routineId, exercise.id, set.id, set.reps, weight);
                    }}
                  />
                  <TextInput
                    style={[styles.setInput, { flex: 1 }]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#475569"
                    defaultValue={set.reps?.toString() || ''}
                    onEndEditing={(e) => {
                      if (!routineId) return;
                      const reps = parseInt(e.nativeEvent.text) || 0;
                      updateSet(routineId, exercise.id, set.id, reps, set.weight);
                    }}
                  />
                  <TouchableOpacity
                    style={{ flex: 0.5 }}
                    onPress={() => handleDeleteSet(exercise.id, set.id, setIndex + 1)}>
                    <Ionicons name="close-circle-outline" size={24} color="#F43F5E" />
                  </TouchableOpacity>
                </View>
              ))}

              {/* Botão Adicionar Série */}
              <TouchableOpacity
                style={styles.addSetButton}
                onPress={() => routineId && addSet(routineId, exercise.id)}>
                <Ionicons name="add-circle-outline" size={20} color="#22C55E" />
                <Text style={styles.addSetButtonText}>Adicionar Série</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Botões Flutuantes */}
      <TouchableOpacity style={styles.backFab} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={28} color="#FFF" />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>

      {/* Modal Adicionar Exercício */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Novo Exercício</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Nome do exercício"
              placeholderTextColor="#64748B"
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewExerciseName('');
                }}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleAddExercise}>
                <Text style={styles.addButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#94A3B8',
    marginTop: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#F43F5E',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  exerciseCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E2E8F0',
  },
  editNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editNameInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    fontSize: 16,
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  restTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  restTimeLabel: {
    color: '#94A3B8',
    fontSize: 14,
    flex: 1,
  },
  restTimeInput: {
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
    fontSize: 16,
    padding: 8,
    borderRadius: 6,
    width: 70,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#334155',
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
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#064E3B',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  addSetButtonText: {
    color: '#22C55E',
    fontSize: 14,
    fontWeight: '600',
  },
  backFab: {
    position: 'absolute',
    left: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#64748B',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#22C55E',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E2E8F0',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#334155',
  },
  cancelButtonText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#22C55E',
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
