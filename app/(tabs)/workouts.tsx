import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RoutineContext } from '@/context/RoutineContext';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useLocalSearchParams } from 'expo-router';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Button, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Configuração das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// expo-notifications no Expo Go
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (message.includes('expo-notifications') || 
      message.includes('Push notifications') ||
      message.includes('shouldShowAlert')) {
    return;
  }
  originalWarn(...args);
};

const originalError = console.error;
console.error = (...args) => {
  const message = typeof args[0] === 'string' ? args[0] : '';
  if (message.includes('expo-notifications') || 
      message.includes('Push notifications')) {
    return;
  }
  originalError(...args);
};

function HeaderBar() {
  return (
    <SafeAreaView style={styles.header}>
      <Text style={styles.appTitle}>Meus Treinos</Text>
    </SafeAreaView>
  );
}

export default function WorkoutsScreen() {
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { 
    getRoutine, 
    addExercise, 
    updateExercise,
    removeExercise, 
    addSet, 
    removeSet, 
    updateSet, 
    toggleSetCompletion,
    updateExerciseRestTime
  } = useContext(RoutineContext);
  
  const routine = useMemo(() => getRoutine(routineId!), [routineId, getRoutine]);
  const exercises = routine?.exercises || [];

  const [newExerciseName, setNewExerciseName] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [activeTimers, setActiveTimers] = useState<Map<string, any>>(new Map());
  const [activeNotifications, setActiveNotifications] = useState<Map<string, string>>(new Map());
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
  const [editingExerciseName, setEditingExerciseName] = useState('');

  // Configurar permissões de notificação
  useEffect(() => {
    const configurateNotifications = async () => {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      const { status } = await Notifications.requestPermissionsAsync();
    };

    configurateNotifications();
  }, []);

  const showToastMessage = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3000);
  };

  const showRestStartConfirmation = (exerciseName: string, restTime: number) => {
    showToastMessage(`⏱️ Descanso de ${restTime}s iniciado para ${exerciseName}`);
  };

  const showRestEndNotification = async (exerciseName: string, restTime: number): Promise<string> => {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: "🔔 Descanso Finalizado!",
        body: `Tempo de descanso de ${restTime}s terminou para ${exerciseName}. Próxima série!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: restTime,
        repeats: false,
      },
    });
    return notificationId;
  };

  const startRestTimer = async (exerciseId: string, exerciseName: string, restTime: number) => {
    // Limpa timer anterior se existir
    const existingTimer = activeTimers.get(exerciseId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Cancela notificação anterior se existir
    const existingNotificationId = activeNotifications.get(exerciseId);
    if (existingNotificationId) {
      await Notifications.cancelScheduledNotificationAsync(existingNotificationId);
    }

    // Mostra confirmação de início via toast
    showRestStartConfirmation(exerciseName, restTime);

    // Agenda notificação que funcionará mesmo em background
    const notificationId = await showRestEndNotification(exerciseName, restTime);
    setActiveNotifications(prev => new Map(prev.set(exerciseId, notificationId)));

    // Mantém referência do timer apenas para limpeza se necessário
    const timer = setTimeout(() => {
      setActiveTimers(prev => {
        const newMap = new Map(prev);
        newMap.delete(exerciseId);
        return newMap;
      });
      setActiveNotifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(exerciseId);
        return newMap;
      });
    }, restTime * 1000);

    setActiveTimers(prev => new Map(prev.set(exerciseId, timer)));
  };

  const handleSetCompletion = async (exerciseId: string, setId: string) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    const isCurrentlyCompleted = set?.isCompleted || false;
    
    toggleSetCompletion(routineId!, exerciseId, setId);
    
    // Se a série estava desmarcada e agora será marcada como concluída, inicia o timer
    if (!isCurrentlyCompleted && exercise && exercise.restTime > 0) {
      await startRestTimer(exerciseId, exercise.name, exercise.restTime);
    }
    // Se a série estava marcada e agora será desmarcada, cancela o timer e notificação
    else if (isCurrentlyCompleted) {
      // Cancela timer se existir
      const existingTimer = activeTimers.get(exerciseId);
      if (existingTimer) {
        clearTimeout(existingTimer);
        setActiveTimers(prev => {
          const newMap = new Map(prev);
          newMap.delete(exerciseId);
          return newMap;
        });
      }
      
      // Cancela notificação se existir
      const existingNotificationId = activeNotifications.get(exerciseId);
      if (existingNotificationId) {
        await Notifications.cancelScheduledNotificationAsync(existingNotificationId);
        setActiveNotifications(prev => {
          const newMap = new Map(prev);
          newMap.delete(exerciseId);
          return newMap;
        });
      }
    }
  };

  const handleAddExercise = () => {
    if (newExerciseName.trim() && routineId) {
      addExercise(routineId, newExerciseName.trim());
      setNewExerciseName('');
      setModalVisible(false);
    }
  };

  const handleEditExercise = (exerciseId: string, currentName: string) => {
    setEditingExerciseId(exerciseId);
    setEditingExerciseName(currentName);
  };

  const handleSaveExercise = () => {
    if (editingExerciseId && editingExerciseName.trim() && routineId) {
      updateExercise(routineId, editingExerciseId, editingExerciseName.trim());
      setEditingExerciseId(null);
      setEditingExerciseName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingExerciseId(null);
    setEditingExerciseName('');
  };

  if (!routine) {
    return (
      <ThemedView style={styles.container}>
        <HeaderBar />
        <View style={styles.scrollContainer}>
          <ThemedText>Rotina não encontrada.</ThemedText>
        </View>
      </ThemedView>
    )
  }

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
              {editingExerciseId === exercise.id ? (
                <View style={styles.editingContainer}>
                  <TextInput
                    style={styles.editingInput}
                    value={editingExerciseName}
                    onChangeText={setEditingExerciseName}
                    autoFocus
                    placeholder="Nome do exercício"
                    placeholderTextColor="#94A3B8"
                  />
                  <TouchableOpacity onPress={handleSaveExercise} style={styles.saveButton}>
                    <Ionicons name="checkmark" size={20} color="#22C55E" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={handleCancelEdit} style={styles.cancelButton}>
                    <Ionicons name="close" size={20} color="#F43F5E" />
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <ThemedText style={styles.exerciseName}>{exercise.name}</ThemedText>
                  <View style={styles.exerciseActions}>
                    <TouchableOpacity onPress={() => handleEditExercise(exercise.id, exercise.name)}>
                      <Ionicons name="pencil" size={20} color="#94A3B8" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeExercise(routineId!, exercise.id)} style={styles.deleteButton}>
                      <Ionicons name="trash-outline" size={22} color="#F43F5E" />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
            
            {/* Campo de tempo de descanso */}
            <View style={styles.restTimeContainer}>
              <Ionicons name="time-outline" size={16} color="#94A3B8" />
              <ThemedText style={styles.restTimeLabel}>Descanso:</ThemedText>
              <TextInput
                style={styles.restTimeInput}
                keyboardType="numeric"
                placeholder="60"
                placeholderTextColor="#94A3B8"
                defaultValue={exercise.restTime?.toString() || '60'}
                onEndEditing={(e) => {
                  const newRestTime = parseInt(e.nativeEvent.text) || 60;
                  updateExerciseRestTime(routineId!, exercise.id, newRestTime);
                }}
              />
              <ThemedText style={styles.restTimeUnit}>seg</ThemedText>
            </View>
            
            {/* Cabeçalho das colunas - só aparece quando há séries */}
            {exercise.sets.length > 0 && (
              <View style={styles.setLabelsContainer}>
                <View style={{ width: 30 }} />
                <Text style={styles.setLabel}>SÉRIE</Text>
                <Text style={styles.setLabel}>KG</Text>
                <Text style={styles.setLabel}>REPS</Text>
                <View style={{ width: 30 }} />
              </View>
            )}

            {exercise.sets.map((set, index) => (
              <View key={set.id} style={styles.setContainer}>
                <TouchableOpacity onPress={() => handleSetCompletion(exercise.id, set.id)}>
                    <Ionicons name={set.isCompleted ? 'checkbox' : 'square-outline'} size={24} color="#22C55E" />
                </TouchableOpacity>
                <Text style={styles.serieNumber}>{index + 1}</Text>
                <TextInput
                  style={[styles.setInput, set.isCompleted && styles.setTextCompleted]}
                  keyboardType="numeric"
                  placeholder="Kg"
                  placeholderTextColor="#94A3B8"
                  defaultValue={set.weight.toString()}
                  onEndEditing={(e) => updateSet(routineId!, exercise.id, set.id, set.reps, parseInt(e.nativeEvent.text) || 0)}
                />
                <TextInput
                  style={[styles.setInput, set.isCompleted && styles.setTextCompleted]}
                  keyboardType="numeric"
                  placeholder="Reps"
                  placeholderTextColor="#94A3B8"
                  defaultValue={set.reps.toString()}
                  onEndEditing={(e) => updateSet(routineId!, exercise.id, set.id, parseInt(e.nativeEvent.text) || 0, set.weight)}
                />
                <TouchableOpacity onPress={() => removeSet(routineId!, exercise.id, set.id)}>
                    <Ionicons name="remove-circle-outline" size={26} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.addSetButton} onPress={() => addSet(routineId!, exercise.id)}>
              <Ionicons name="add" size={20} color="#22C55E" />
              <Text style={styles.addSetButtonText}>Adicionar Série</Text>
            </TouchableOpacity>
          </ThemedView>
        ))}
      </ScrollView>
      
      {/* Toast de confirmação */}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
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
    padding: 16,
    marginBottom: 16,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exerciseName: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  restTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    padding: 8,
  },
  restTimeLabel: {
    color: '#94A3B8',
    fontSize: 13,
    marginLeft: 6,
    marginRight: 8,
  },
  restTimeInput: {
    backgroundColor: '#1E293B',
    color: '#E2E8F0',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    width: 50,
    textAlign: 'center',
    marginRight: 4,
  },
  restTimeUnit: {
    color: '#94A3B8',
    fontSize: 13,
  },
  setLabelsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 10,
    marginBottom: 8,
    justifyContent: 'space-between',
  },
  setLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    width: 50,
  },
  setContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 4,
  },
  setTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#4A5568',
  },
  setInput: {
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: 50,
    textAlign: 'center',
    marginHorizontal: 4,
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
  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#22C55E',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    minWidth: 280,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  editingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  editingInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    fontSize: 16,
    marginRight: 8,
  },
  saveButton: {
    padding: 8,
    marginRight: 4,
  },
  cancelButton: {
    padding: 8,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 12,
  },
  serieNumber: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    width: 50,
  },
});
