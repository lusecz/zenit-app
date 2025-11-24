import React, { useContext, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import { RoutineContext } from '@/context/RoutineContext';
import { isValidName } from '@/helpers/validators';

import Toast from '@/components/Toast';
import { ConfirmModal } from '@/components/ConfirmModal';

import { Ionicons } from '@expo/vector-icons';

export default function RoutinesScreen() {
  const router = useRouter();

  const {
    routines,
    addRoutine,
    updateRoutine,
    removeRoutine,
    loading,
  } = useContext(RoutineContext);

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
    setTimeout(() => setToastVisible(false), 2500);
  };

  const handleCreate = () => {
    if (!isValidName(creatingName)) {
      showToast('Nome inválido. Use pelo menos 2 caracteres.');
      return;
    }

    const res = addRoutine(creatingName);

    showToast(res.message);

    if (res.success) {
      setCreatingName('');

      // Pegamos a última rotina (a recém-criada)
      const newRoutine = routines[routines.length - 1];

      if (newRoutine) {
        router.push({
          pathname: "/edit-routine",
          params: { routineId: newRoutine.id },
        });
      }
    }
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
    showToast(res.message);

    setConfirmVisible(false);
    setToRemoveId(null);
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.item}>
      {editingId === item.id ? (
        <>
          <TextInput
            value={editingName}
            onChangeText={setEditingName}
            style={styles.inputInline}
          />

          <TouchableOpacity onPress={applyEdit} style={styles.iconButton}>
            <Ionicons name="checkmark" size={20} color="#22c55e" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEditingId(null);
              setEditingName('');
            }}
            style={styles.iconButton}
          >
            <Ionicons name="close" size={20} color="#f43f5e" />
          </TouchableOpacity>
        </>
      ) : (
        <>
          {/* Abrir editor da rotina */}
          <TouchableOpacity
            style={{ flex: 1 }}
            onPress={() =>
              router.push({
                pathname: "/edit-routine",
                params: { routineId: item.id },
              })
            }
          >
            <Text style={styles.title}>{item.name}</Text>
          </TouchableOpacity>

          <View style={styles.actions}>
            {/* Iniciar treino */}
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/execute-workout",
                  params: { routineId: item.id },
                })
              }
              style={styles.iconButton}
            >
              <Ionicons name="play" size={20} color="#22c55e" />
            </TouchableOpacity>

            {/* Editar nome */}
            <TouchableOpacity
              onPress={() => startEdit(item.id, item.name)}
              style={styles.iconButton}
            >
              <Ionicons name="create-outline" size={20} color="#94a3b8" />
            </TouchableOpacity>

            {/* Excluir */}
            <TouchableOpacity
              onPress={() => confirmDelete(item.id)}
              style={styles.iconButton}
            >
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
      {/* Header criar rotina */}
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
        ListEmptyComponent={
          <Text style={{ color: '#94a3b8' }}>Nenhuma rotina encontrada.</Text>
        }
      />

      {/* Modal confirmar exclusão */}
      <ConfirmModal
        visible={confirmVisible}
        message="Tem certeza que deseja deletar esta rotina?"
        onConfirm={doDelete}
        onCancel={() => setConfirmVisible(false)}
      />

      <Toast visible={toastVisible} message={toastMessage} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },

  headerRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },

  header: {
    padding: 16,
    color: '#E2E8F0',
    fontSize: 16,
  },

  input: {
    flex: 1,
    backgroundColor: '#071025',
    color: '#E6E6E6',
    padding: 12,
    borderRadius: 8,
  },

  inputInline: {
    flex: 1,
    backgroundColor: '#071025',
    color: '#E6E6E6',
    padding: 8,
    borderRadius: 6,
  },

  createButton: {
    backgroundColor: '#22C55E',
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: 8,
  },

  createText: {
    color: '#0F172A',
    fontWeight: '700',
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0B1220',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },

  title: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
  },

  iconButton: {
    padding: 6,
    marginLeft: 8,
  },
});
