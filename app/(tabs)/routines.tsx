import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { RoutineContext } from '@/context/RoutineContext';
import { Link } from 'expo-router';
import React, { useContext, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

export default function RoutinesScreen() {
  const { routines, addRoutine, loading } = useContext(RoutineContext);
  const [newRoutineName, setNewRoutineName] = useState('');

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Carregando rotinas...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Rotinas</ThemedText>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Digite o nome da nova rotina"
          value={newRoutineName}
          onChangeText={setNewRoutineName}
        />
        <Button title="Adicionar" onPress={() => {
          if (newRoutineName.trim()) {
            addRoutine(newRoutineName);
            setNewRoutineName('');
          }
        }} />
      </View>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.routineItem}>
            <Link href={{ pathname: "/workouts", params: { routineId: item.id } }} asChild>
              <Text style={styles.routineName}>{item.name}</Text>
            </Link>
          </View>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginRight: 10,
    borderRadius: 5,
  },
  routineItem: {
    padding: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  routineName: {
    fontSize: 18,
  },
});
