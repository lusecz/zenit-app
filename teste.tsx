// Refactored CRUD screens and helper components for ZenitApp
// This file contains the improved implementations for the CRUD flow requested in the feature/crud-refactor branch.
// Drop each code block into the corresponding file in your project under app/ or components/.

// ===========================
// components/Toast.tsx
// Global lightweight toast to show messages
// ===========================
import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface ToastProps {
  visible: boolean;
  message: string;
}

export default function Toast({ visible, message }: ToastProps) {
  const opacity = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      const t = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }, 2800);
      return () => clearTimeout(t);
    }
  }, [visible]);

  if (!message) return null;

  return (
    <Animated.View pointerEvents="none" style={[styles.container, { opacity }]}> 
      <View style={styles.bubble}>
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: '#111827',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  text: {
    color: '#E6E6E6',
    fontSize: 14,
  },
});


// ===========================
// components/ConfirmModal.tsx
// Modal para confirmar ações destrutivas
// ===========================
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ConfirmModalProps {
  visible: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ visible, title = 'Confirmar', message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
              <Text style={styles.confirmText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: '86%',
    backgroundColor: '#0f172a',
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  title: { color: '#E6E6E6', fontSize: 18, fontWeight: '700', marginBottom: 8 },
  message: { color: '#94a3b8', fontSize: 14, marginBottom: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
  button: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
  cancel: { backgroundColor: '#334155', marginRight: 8 },
  confirm: { backgroundColor: '#064e3b' },
  cancelText: { color: '#e6e6e6', fontWeight: '600' },
  confirmText: { color: '#22c55e', fontWeight: '700' },
});


// ===========================
// helpers/validators.ts
// Small helper functions for validation
// ===========================
export const isValidName = (s: string, min = 2, max = 120) => {
  if (!s) return false;
  const cleaned = s.trim();
  return cleaned.length >= min && cleaned.length <= max;
};

export const sanitizeNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  if (isNaN(n) || !isFinite(n)) return fallback;
  return n < 0 ? fallback : n;
};


// ===========================
// app/(tabs)/routines.tsx  (UPDATED RoutinesScreen)
// ===========================
import React, { useContext, useMemo, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RoutineContext } from '@/context/RoutineContext';
import { isValidName } from '@/helpers/validators';
import Toast from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Ionicons } from '@expo/vector-icons';

export default function RoutinesScreen() {
  const { routines, addRoutine, updateRoutine, removeRoutine, loading } = useContext(RoutineContext);

  const [creatingName, setCreatingName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toRemoveId, setToRemoveId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  const handleCreate = () => {
    if (!isValidName(creatingName)) {
      showToast('Nome inválido. Use pelo menos 2 caracteres.');
      return;
    }
    const res = addRoutine(creatingName);
    if (!res.success) {
      showToast(res.message);
      return;
    }
    setCreatingName('');
    showToast(res.message);
  };

  const startEdit = (id: string, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const applyEdit = () => {
    if (!editingId) return;
    if (!isValidName(editingName)) {
      showToast('Nome inválido para edição.');
      return;
    }
    const res = updateRoutine(editingId, editingName);
    showToast(res.message);
    setEditingId(null);
    setEditingName('');
  };

  const confirmDelete = (id: string) => {
    setToRemoveId(id);
    setConfirmVisible(true);
  };

  const doDelete = () => {
    if (!toRemoveId) return;
    const res = removeRoutine(toRemoveId);
    setConfirmVisible(false);
    setToRemoveId(null);
    showToast(res.message);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      {editingId === item.id ? (
        <>
          <TextInput value={editingName} onChangeText={setEditingName} style={styles.inputInline} />
          <TouchableOpacity onPress={applyEdit} style={styles.iconButton}>
            <Ionicons name="checkmark" size={20} color="#22c55e" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setEditingId(null); setEditingName(''); }} style={styles.iconButton}>
            <Ionicons name="close" size={20} color="#f43f5e" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.title}>{item.name}</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => startEdit(item.id, item.name)} style={styles.iconButton}>
              <Ionicons name="create-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.iconButton}>
              <Ionicons name="trash-outline" size={20} color="#f43f5e" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Carregando rotinas...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <TextInput
          placeholder="Nova rotina"
          placeholderTextColor="#94a3b8"
          value={creatingName}
          onChangeText={setCreatingName}
          style={styles.input}
        />
        <TouchableOpacity onPress={handleCreate} style={styles.createButton}>
          <Text style={styles.createText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={routines}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={<Text style={{ color: '#94a3b8' }}>Nenhuma rotina encontrada.</Text>}
      />

      <ConfirmModal
        visible={confirmVisible}
        message="Tem certeza que deseja deletar esta rotina? Esta ação não pode ser desfeita."
        onConfirm={doDelete}
        onCancel={() => setConfirmVisible(false)}
      />

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { padding: 16, color: '#E2E8F0' },
  headerRow: { flexDirection: 'row', padding: 16, gap: 8 },
  input: { flex: 1, backgroundColor: '#071025', color: '#E6E6E6', padding: 12, borderRadius: 8 },
  inputInline: { flex: 1, backgroundColor: '#071025', color: '#E6E6E6', padding: 8, borderRadius: 6 },
  createButton: { backgroundColor: '#22C55E', paddingHorizontal: 14, justifyContent: 'center', borderRadius: 8 },
  createText: { color: '#0F172A', fontWeight: '700' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#0B1220', borderRadius: 8, marginBottom: 10 },
  title: { color: '#E2E8F0', fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 10 },
  iconButton: { padding: 6, marginLeft: 8 },
});


// ===========================
// app/(tabs)/edit-routine.tsx  (UPDATED EditRoutineScreen)
// ===========================
import React, { useContext, useMemo, useState } from 'react';
import { Alert, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RouteProp, useRouter, useSearchParams } from 'expo-router';
import { RoutineContext } from '@/context/RoutineContext';
import { isValidName, sanitizeNumber } from '@/helpers/validators';
import Toast from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Ionicons } from '@expo/vector-icons';

export default function EditRoutineScreen() {
  const { routineId } = useSearchParams();
  const router = useRouter();
  const { getRoutine, addExercise, updateExercise, removeExercise, addSet, updateSet, removeSet, updateExerciseRestTime } = useContext(RoutineContext);

  const routine = useMemo(() => (typeof routineId === 'string' ? getRoutine(routineId) : undefined), [routineId]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [editingExercise, setEditingExercise] = useState<{ id: string; name: string } | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDelete, setToDelete] = useState<{ kind: 'exercise' | 'set'; exId: string; setId?: string } | null>(null);

  const showToast = (msg: string) => { setToastMessage(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); };

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Rotina não encontrada.</Text>
      </SafeAreaView>
    );
  }

  const handleAddExercise = () => {
    if (!isValidName(newExerciseName)) { showToast('Nome inválido'); return; }
    const res = addExercise(routine.id, newExerciseName);
    showToast(res.message);
    if (res.success) {
      setNewExerciseName('');
      setModalVisible(false);
    }
  };

  const startEditExercise = (ex: any) => { setEditingExercise(ex); setNewExerciseName(ex.name); setModalVisible(true); };

  const applyEditExercise = () => {
    if (!editingExercise) return;
    if (!isValidName(newExerciseName)) { showToast('Nome inválido'); return; }
    const res = updateExercise(routine.id, editingExercise.id, newExerciseName);
    showToast(res.message);
    if (res.success) { setModalVisible(false); setEditingExercise(null); setNewExerciseName(''); }
  };

  const confirmDeleteExercise = (exId: string) => {
    setToDelete({ kind: 'exercise', exId });
    setConfirmVisible(true);
  };

  const confirmDeleteSet = (exId: string, setId: string) => {
    setToDelete({ kind: 'set', exId, setId });
    setConfirmVisible(true);
  };

  const doDelete = () => {
    if (!toDelete) return;
    if (toDelete.kind === 'exercise') {
      const res = removeExercise(routine.id, toDelete.exId);
      showToast(res.message);
    } else {
      const res = removeSet(routine.id, toDelete.exId, toDelete.setId!);
      showToast(res.message);
    }
    setConfirmVisible(false);
    setToDelete(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={28} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.title}>{routine.name}</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={28} color="#22c55e" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {routine.exercises.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyText}>Nenhum exercício adicionado.</Text></View>
        ) : (
          routine.exercises.map((ex) => (
            <View key={ex.id} style={styles.exerciseCard}>
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>{ex.name}</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <TouchableOpacity onPress={() => startEditExercise(ex)}>
                    <Ionicons name="create-outline" size={20} color="#94a3b8" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDeleteExercise(ex.id)}>
                    <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.restRow}>
                <Text style={styles.restLabel}>Descanso (s):</Text>
                <TextInput
                  keyboardType="numeric"
                  defaultValue={String(ex.restTime ?? 60)}
                  onEndEditing={(e) => updateExerciseRestTime(routine.id, ex.id, sanitizeNumber(e.nativeEvent.text, 60))}
                  style={styles.restInput}
                />
              </View>

              {ex.sets.map((s, idx) => (
                <View key={s.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>{idx + 1}</Text>
                  <TextInput
                    keyboardType="numeric"
                    defaultValue={String(s.weight ?? 0)}
                    onEndEditing={(e) => updateSet(routine.id, ex.id, s.id, s.reps, sanitizeNumber(e.nativeEvent.text, 0))}
                    style={styles.smallInput}
                  />
                  <TextInput
                    keyboardType="numeric"
                    defaultValue={String(s.reps ?? 0)}
                    onEndEditing={(e) => updateSet(routine.id, ex.id, s.id, sanitizeNumber(e.nativeEvent.text, 0), s.weight)}
                    style={styles.smallInput}
                  />
                  <TouchableOpacity onPress={() => confirmDeleteSet(ex.id, s.id)}>
                    <Ionicons name="remove-circle-outline" size={22} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity style={styles.addSetBtn} onPress={() => addSet(routine.id, ex.id)}>
                <Ionicons name="add" size={18} color="#22c55e" />
                <Text style={styles.addSetText}>Adicionar Série</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{editingExercise ? 'Editar Exercício' : 'Novo Exercício'}</Text>
            <TextInput
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="Nome do exercício"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
              <TouchableOpacity onPress={() => { setModalVisible(false); setEditingExercise(null); setNewExerciseName(''); }} style={styles.modalCancel}>
                <Text style={{ color: '#E6E6E6' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={editingExercise ? applyEditExercise : handleAddExercise} style={styles.modalConfirm}>
                <Text style={{ color: '#fff' }}>{editingExercise ? 'Salvar' : 'Adicionar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal visible={confirmVisible} message={'Confirma exclusão?'} onConfirm={doDelete} onCancel={() => setConfirmVisible(false)} />

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#0B1220' },
  title: { color: '#22C55E', fontWeight: '700', fontSize: 18 },
  content: { padding: 12 },
  errorText: { color: '#F43F5E', padding: 16 },
  empty: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#94A3B8' },
  exerciseCard: { backgroundColor: '#071025', padding: 12, borderRadius: 10, marginBottom: 12 },
  exerciseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  exerciseTitle: { color: '#E2E8F0', fontWeight: '700' },
  restRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  restLabel: { color: '#94A3B8' },
  restInput: { width: 90, backgroundColor: '#0F172A', color: '#E2E8F0', padding: 8, borderRadius: 6 },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  setNumber: { color: '#94A3B8', width: 28, textAlign: 'center' },
  smallInput: { width: 84, backgroundColor: '#0F172A', color: '#E2E8F0', padding: 8, borderRadius: 6 },
  addSetBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderRadius: 8, backgroundColor: '#081322', justifyContent: 'center' },
  addSetText: { color: '#22C55E' },
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalBox: { width: '88%', backgroundColor: '#0B1220', borderRadius: 12, padding: 16 },
  modalTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '700', marginBottom: 12 },
  input: { backgroundColor: '#071025', color: '#E6E6E6', padding: 12, borderRadius: 8, marginBottom: 12 },
  modalCancel: { padding: 10 },
  modalConfirm: { backgroundColor: '#22C55E', padding: 10, borderRadius: 8 },
});


// ===========================
// app/(tabs)/workouts.tsx  (UPDATED WorkoutsScreen - management of exercises within a routine)
// ===========================
import React, { useContext, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSearchParams, useRouter } from 'expo-router';
import { RoutineContext } from '@/context/RoutineContext';
import Toast from '@/components/Toast';
import { Ionicons } from '@expo/vector-icons';
import { sanitizeNumber, isValidName } from '@/helpers/validators';

export default function WorkoutsScreen() {
  const { routineId } = useSearchParams();
  const router = useRouter();
  const { getRoutine, addExercise, updateExercise, addSet, updateSet, removeExercise, removeSet, toggleSetCompletion } = useContext(RoutineContext);

  const routine = useMemo(() => (typeof routineId === 'string' ? getRoutine(routineId) : undefined), [routineId]);

  const [newExercise, setNewExercise] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg: string) => { setToastMessage(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); };

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}><Text style={styles.error}>Rotina não encontrada.</Text></SafeAreaView>
    );
  }

  const handleAddExercise = () => {
    if (!isValidName(newExercise)) { showToast('Nome inválido'); return; }
    const res = addExercise(routine.id, newExercise);
    showToast(res.message);
    if (res.success) setNewExercise('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle" size={26} color="#94a3b8" />
        </TouchableOpacity>
        <Text style={styles.title}>{routine.name}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.addRow}>
          <TextInput placeholder="Adicionar exercício" value={newExercise} onChangeText={setNewExercise} placeholderTextColor="#94a3b8" style={styles.input} />
          <TouchableOpacity onPress={handleAddExercise} style={styles.addBtn}><Text style={{ color: '#0F172A' }}>Adicionar</Text></TouchableOpacity>
        </View>

        {routine.exercises.map((ex) => (
          <View key={ex.id} style={styles.exerciseCard}>
            <View style={styles.rowTop}>
              <Text style={styles.exerciseTitle}>{ex.name}</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity onPress={() => addSet(routine.id, ex.id)}><Ionicons name="add-circle" size={22} color="#22C55E" /></TouchableOpacity>
                <TouchableOpacity onPress={() => removeExercise(routine.id, ex.id)}><Ionicons name="trash-outline" size={22} color="#f43f5e" /></TouchableOpacity>
              </View>
            </View>

            {ex.sets.map((s, idx) => (
              <View key={s.id} style={styles.setRow}>
                <TouchableOpacity onPress={() => toggleSetCompletion(routine.id, ex.id, s.id)}>
                  <Ionicons name={s.isCompleted ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={s.isCompleted ? '#22C55E' : '#94a3b8'} />
                </TouchableOpacity>
                <Text style={styles.setIndex}>{idx + 1}</Text>
                <TextInput defaultValue={String(s.weight || '')} onEndEditing={(e) => updateSet(routine.id, ex.id, s.id, s.reps, sanitizeNumber(e.nativeEvent.text, 0))} style={styles.smallInput} />
                <TextInput defaultValue={String(s.reps || '')} onEndEditing={(e) => updateSet(routine.id, ex.id, s.id, sanitizeNumber(e.nativeEvent.text, 0), s.weight)} style={styles.smallInput} />
                <TouchableOpacity onPress={() => removeSet(routine.id, ex.id, s.id)}><Ionicons name="remove-circle-outline" size={22} color="#94a3b8" /></TouchableOpacity>
              </View>
            ))}

          </View>
        ))}

      </ScrollView>

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, backgroundColor: '#0B1220' },
  title: { color: '#22C55E', fontWeight: '700' },
  content: { padding: 12 },
  addRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#071025', color: '#E6E6E6', padding: 12, borderRadius: 8 },
  addBtn: { backgroundColor: '#22C55E', padding: 12, borderRadius: 8, justifyContent: 'center' },
  exerciseCard: { backgroundColor: '#071025', padding: 12, borderRadius: 10, marginBottom: 12 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  exerciseTitle: { color: '#E2E8F0', fontWeight: '700' },
  setRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  setIndex: { color: '#94a3b8', width: 28, textAlign: 'center' },
  smallInput: { width: 80, backgroundColor: '#0F172A', color: '#E2E8F0', padding: 8, borderRadius: 6 },
  error: { padding: 20, color: '#F43F5E' },
});


// ===========================
// Integration notes
// ===========================

/*
1) Files to create/update in your project (suggested paths):
 - components/Toast.tsx           (copy Toast component)
 - components/ConfirmModal.tsx    (copy ConfirmModal)
 - helpers/validators.ts          (copy helper functions)
 - app/(tabs)/routines.tsx        (replaces existing routines screen)
 - app/(tabs)/edit-routine.tsx    (replaces edit routine screen)
 - app/(tabs)/workouts.tsx        (replaces workouts screen)

2) RoutineContext: you already applied the improved RoutineContext earlier. The screens expect returned objects { success, message } from CRUD operations.

3) Styling & theme: I matched your dark theme palette used across the app. Tweak colors in styles as desired.

4) Toast/ConfirmModal: lightweight implementations. You may replace them with a global provider (Context) later for more features.

5) Expo Router params: I used useSearchParams which matches Expo Router v2+. If your router setup uses a different param approach, adapt accordingly.

6) After adding files, run:
   npm install
   npx expo start -c

7) If you want, I can open a PR patch (diff) ready to commit with these exact files. Say the word and I generate the git commands.
*/
