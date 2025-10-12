import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { WorkoutContext } from '@/context/WorkoutContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useContext, useState } from 'react';
import { Button, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

function HeaderBar() {
  return (
    <SafeAreaView style={styles.header}>
      <Text style={styles.appTitle}>Meus Treinos</Text>
    </SafeAreaView>
  );
}

export default function WorkoutsScreen() {
  const { exercises, addExercise, removeExercise, addSet, removeSet, updateSet, toggleSetCompletion } = useContext(WorkoutContext);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);

  const handleAddExercise = () => {
    if (newExerciseName.trim()) {
      addExercise(newExerciseName.trim());
      setNewExerciseName('');
      setModalVisible(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <HeaderBar />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <ThemedText style={styles.title}>Gerencie seus Exercícios</ThemedText>
          <ThemedText style={styles.subtitle}>Adicione, remova e atualize seus exercícios e séries.</ThemedText>
        </View>

        <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
          <ThemedText style={styles.buttonText}>Adicionar Novo Exercício</ThemedText>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <ThemedText style={styles.modalTitle}>Novo Exercício</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Nome do Exercício"
                placeholderTextColor="#94A3B8"
                value={newExerciseName}
                onChangeText={setNewExerciseName}
              />
              <View style={styles.modalButtonContainer}>
                <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#F43F5E" />
                <Button title="Adicionar" onPress={handleAddExercise} color="#22C55E" />
              </View>
            </View>
          </View>
        </Modal>

        {exercises.map((exercise) => (
          <ThemedView key={exercise.id} style={styles.exerciseContainer}>
            <View style={styles.exerciseHeader}>
              <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
              <TouchableOpacity onPress={() => removeExercise(exercise.id)}>
                <Ionicons name="trash-outline" size={22} color="#F43F5E" />
              </TouchableOpacity>
            </View>
            
            {exercise.sets.length > 0 && (
              <View style={styles.setContainer}>
                <View style={{ width: 24 }} />
                <Text style={[styles.setText, { color: 'transparent' }]}>Série X</Text>
                <Text style={styles.setLabel}>KG</Text>
                <Text style={styles.setLabel}>REPS</Text>
                <View style={{ width: 22 }} />
              </View>
            )}

            {exercise.sets.map((set, index) => (
              <View key={set.id} style={styles.setContainer}>
                <TouchableOpacity onPress={() => toggleSetCompletion(exercise.id, set.id)}>
                    <Ionicons name={set.isCompleted ? 'checkbox' : 'square-outline'} size={24} color="#22C55E" />
                </TouchableOpacity>
                <Text style={styles.setText}>Série {index + 1}</Text>
                <TextInput
                  style={[styles.setInput, set.isCompleted && styles.setTextCompleted]}
                  keyboardType="numeric"
                  placeholder="Kg"
                  placeholderTextColor="#94A3B8"
                  defaultValue={set.weight.toString()}
                  onEndEditing={(e) => updateSet(exercise.id, set.id, set.reps, parseInt(e.nativeEvent.text) || 0)}
                />
                <TextInput
                  style={[styles.setInput, set.isCompleted && styles.setTextCompleted]}
                  keyboardType="numeric"
                  placeholder="Reps"
                  placeholderTextColor="#94A3B8"
                  defaultValue={set.reps.toString()}
                  onEndEditing={(e) => updateSet(exercise.id, set.id, parseInt(e.nativeEvent.text) || 0, set.weight)}
                />
                <TouchableOpacity onPress={() => removeSet(exercise.id, set.id)}>
                    <Ionicons name="remove-circle-outline" size={22} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(exercise.id)}>
              <Ionicons name="add" size={20} color="#22C55E" />
              <Text style={styles.addSetButtonText}>Adicionar Série</Text>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ScrollView>
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
  scrollContainer: {
    padding: 20,
    paddingTop: 10,
  },
  section: {
    marginBottom: 28,
  },
  title: {
    color: '#E2E8F0',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 15,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
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
  exerciseContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  setLabelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    marginBottom: 5,
  },
  setLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    width: '20%',
  },
  exerciseName: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  setText: {
    color: '#94A3B8',
    fontSize: 15,
    width: '20%',
  },
  setTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#4A5568',
  },
  setInput: {
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    width: '20%',
    textAlign: 'center',
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 5,
    paddingVertical: 8,
    marginTop: 10,
  },
  addSetButtonText: {
    color: '#22C55E',
    marginLeft: 5,
  },
});
