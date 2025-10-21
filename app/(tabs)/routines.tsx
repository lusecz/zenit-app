import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RoutineContext } from '@/context/RoutineContext';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useContext, useState } from 'react';
import {
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
            <Link href={{ pathname: '/workouts', params: { routineId: item.id } }} asChild>
              <TouchableOpacity style={styles.routineNameContainer}>
                <Text style={styles.routineName}>{item.name}</Text>
              </TouchableOpacity>
            </Link>
            <View style={styles.routineActions}>
              <TouchableOpacity onPress={() => openEditModal(item)}>
                <Ionicons name="pencil" size={28} color="#94A3B8" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => removeRoutine(item.id)}>
                <Ionicons name="trash" size={28} color="#F43F5E" />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineNameContainer: {
    flex: 1,
  },
  routineName: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  routineActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
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
