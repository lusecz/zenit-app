import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, StatusBar } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>

        {/* Cabeçalho */}
        <View style={styles.section}>
          <Text style={styles.headerTitle}>Olá, Bruno! 👋</Text>
          <Text style={styles.subtitle}>Pronto para o treino de hoje?</Text>
        </View>

        {/* Treino de Hoje */}
        <View style={styles.section}>
          <Text style={styles.title}>Treino de Hoje</Text>
          <Text style={styles.subtitle}>Push Day - Peito & Tríceps</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Iniciar Treino</Text>
          </TouchableOpacity>
        </View>

        {/* Progresso Semanal */}
        <View style={styles.section}>
          <Text style={styles.title}>Progresso Semanal</Text>
          <Text style={styles.subtitle}>4 de 5 treinos completados</Text>
        </View>
        
        {/* Métricas */}
        <View style={styles.section}>
          <Text style={styles.title}>Métricas da Semana</Text>
          <Text style={styles.subtitle}>Volume Total: 12.5KG</Text>
          <Text style={styles.subtitle}>Treinos Realizados: 4</Text>
        </View>

        {/* Ações Rápidas */}
        <View style={styles.section}>
          <Text style={styles.title}>Ações Rápidas</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Ver Meus Treinos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Histórico</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContainer: {
    padding: 20,
    paddingTop: 50,
  },
  section: {
    marginBottom: 32,
  },
  headerTitle: {
    color: '#E2E8F0',
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    color: '#E2E8F0',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionButton: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#E2E8F0',
    fontSize: 16,
  }
});

