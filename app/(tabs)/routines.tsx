import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RoutineContext } from '@/context/RoutineContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
  Alert,
  Button,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

function HeaderBar() {
  return (
    <SafeAreaView style={styles.header}>
      <Text style={styles.appTitle}>Rotinas</Text>
    </SafeAreaView>
  );
}

export default function RoutinesScreen() {
  const { routines, addRoutine, removeRoutine, updateRoutine, loading } = useContext(RoutineContext);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoutineName, setNewRoutineName] = useState('');
  const [editingRoutine, setEditingRoutine] = useState<{ id: string; name: string } | null>(null);

  const handleSaveRoutine = () => {
    if (newRoutineName.trim()) {
      if (editingRoutine) {
        updateRoutine(editingRoutine.id, newRoutineName);
      } else {
        addRoutine(newRoutineName);
      }
      setNewRoutineName('');
      setEditingRoutine(null);
      setModalVisible(false);
    }
  };

  const openEditModal = (routine: { id: string; name: string }) => {
    setEditingRoutine(routine);
    setNewRoutineName(routine.name);
    setModalVisible(true);
  };

  const openAddModal = () => {
    setEditingRoutine(null);
    setNewRoutineName('');
    setModalVisible(true);
  };

  const handleDeleteRoutine = (routineId: string, routineName: string) => {
    Alert.alert(
      'Deletar Rotina',
      `Tem certeza que deseja deletar "${routineName}"? Esta ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: () => removeRoutine(routineId),
        },
      ]
    );
  };

  const handleEditRoutine = (routineId: string) => {
    router.push(`/edit-routine?routineId=${routineId}` as any);
  };

  const handleExecuteRoutine = (routineId: string) => {
    router.push(`/execute-workout?routineId=${routineId}` as any);
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <HeaderBar />
        <View style={styles.content}>
          <ThemedText>Carregando rotinas...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <HeaderBar />
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <View style={styles.routineItemContainer}>
            <View style={styles.routineHeader}>
              <Text style={styles.routineName}>{item.name}</Text>
              <View style={styles.routineHeaderActions}>
                <TouchableOpacity onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={24} color="#94A3B8" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteRoutine(item.id, item.name)}>
                  <Ionicons name="trash-outline" size={24} color="#F43F5E" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.routineActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditRoutine(item.id)}>
                <Ionicons name="settings-outline" size={20} color="#64748B" />
                <Text style={styles.actionButtonText}>Editar Exercícios</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.executeButton]}
                onPress={() => handleExecuteRoutine(item.id)}>
                <Ionicons name="play-circle" size={20} color="#22C55E" />
                <Text style={[styles.actionButtonText, styles.executeButtonText]}>
                  Iniciar Treino
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAddModal}>
        <Ionicons name="add" size={42} color="#0F172A" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <ThemedText style={styles.modalTitle}>
              {editingRoutine ? 'Editar Rotina' : 'Nova Rotina'}
            </ThemedText>
            <TextInput
              style={styles.input}
              placeholder="Nome da Rotina"
              placeholderTextColor="#94A3B8"
              value={newRoutineName}
              onChangeText={setNewRoutineName}
            />
            <View style={styles.modalButtonContainer}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#F43F5E" />
              <Button title="Salvar" onPress={handleSaveRoutine} color="#22C55E" />
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
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
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 14,
  },
  appTitle: {
    color: '#22C55E',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  content: {
    padding: 20,
  },
  routineItemContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineHeaderActions: {
    flexDirection: 'row',
    gap: 12,
  },
  routineName: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  routineActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  editButton: {
    backgroundColor: '#334155',
  },
  executeButton: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  actionButtonText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  executeButtonText: {
    color: '#22C55E',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#22C55E',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#E2E8F0',
  },
  input: {
    width: '100%',
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});
