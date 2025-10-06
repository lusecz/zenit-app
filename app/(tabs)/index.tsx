import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

function HeaderBar() {
  return (
    <SafeAreaView style={styles.header}>
      {/* Ícone do Menu (simulando drawer ou ação futura) */}
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="menu" size={28} color="#E2E8F0" />
      </TouchableOpacity>
      {/* Nome do App centralizado */}
      <Text style={styles.appTitle}>ZenitApp</Text>
      {/* Ícone de Perfil */}
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="person-circle-outline" size={28} color="#E2E8F0" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeaderBar />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.headerTitle}>Bem-vindo, Bruno! 👋</Text>
          <Text style={styles.subtitle}>
            Controle seu treino diário com praticidade e incrível motivação.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.tagline}>
            Organização e progresso em cada treino!
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Treino de Hoje</Text>
          <Text style={styles.subtitle}>Push Day - Peito & Tríceps</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Iniciar Treino</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Progresso Semanal</Text>
          <Text style={styles.subtitle}>Você completou 4 de 5 treinos previstos 🚀</Text>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.title}>Métricas da Semana</Text>
          <Text style={styles.subtitle}>Volume Total: 12.5KG</Text>
          <Text style={styles.subtitle}>Treinos Realizados: 4</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.title}>Ações Rápidas</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Exercícios cadastrados</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Organizar treinos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Visualizar histórico</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Projeto acadêmico por Philip Escudero e equipe.
          </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 18,
    paddingTop: 40,
    paddingBottom: 14,
  },
  iconButton: {
    padding: 6,
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
  headerTitle: {
    color: '#E2E8F0',
    fontSize: 26,
    fontWeight: 'bold',
  },
  tagline: {
    color: '#22C55E',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
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
    marginTop: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#E2E8F0',
    fontSize: 15,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 12,
  },
});
