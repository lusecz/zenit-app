import React, { useContext, useMemo } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { RoutineContext } from "@/context/RoutineContext";
import { WorkoutHistoryContext } from "@/context/WorkoutHistoryContext";

export default function HomeScreen() {
  const router = useRouter();
  const { routines } = useContext(RoutineContext);
  const { sessions } = useContext(WorkoutHistoryContext);

  // Seleciona a última rotina utilizada, ou a primeira cadastrada
  const routineToStart = useMemo(() => {
    if (sessions.length > 0) {
      const last = sessions[0];
      return routines.find((r) => r.id === last.routineId) || routines[0];
    }
    return routines[0];
  }, [sessions, routines]);

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Ionicons name="menu" size={28} color="#E2E8F0" />
        <Text style={styles.logo}>ZenitApp</Text>
        <Ionicons name="person-circle-outline" size={30} color="#E2E8F0" />
      </View>

      <View style={styles.inner}>
        <Text style={styles.welcomeTitle}>Bem-vindo! 👋</Text>
        <Text style={styles.subtitle}>
          Controle seu treino diário com praticidade e motivação.
        </Text>

        {/* CARD HOJE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Treino de Hoje</Text>
          <Text style={styles.cardSubtitle}>
            {routineToStart ? routineToStart.name : "Nenhuma rotina definida"}
          </Text>

          <TouchableOpacity
            style={styles.startButton}
            onPress={() => {
              if (!routineToStart) {
                alert("Nenhuma rotina cadastrada.");
                return;
              }
              router.push(`/execute-workout?routineId=${routineToStart.id}`);
            }}
          >
            <Text style={styles.startButtonText}>Iniciar Treino</Text>
          </TouchableOpacity>
        </View>

        {/* AÇÕES RÁPIDAS */}
        <Text style={styles.sectionTitle}>Ações Rápidas</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/exercise-library")}
        >
          <Ionicons name="library-outline" size={22} color="#22c55e" />
          <Text style={styles.actionText}>Exercícios cadastrados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/routines")}
        >
          <Ionicons name="construct-outline" size={22} color="#22c55e" />
          <Text style={styles.actionText}>Organizar treinos</Text>
        </TouchableOpacity>

        {/* TROQUEI /history POR /routines-history OU /stats PARA EVITAR ERRO */}
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/routines")} 
        >
          <Ionicons name="bar-chart-outline" size={22} color="#22c55e" />
          <Text style={styles.actionText}>Visualizar histórico</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },

  header: {
    height: 68,
    backgroundColor: "#0B1220",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },

  logo: {
    color: "#22c55e",
    fontSize: 22,
    fontWeight: "700",
  },

  inner: { padding: 20 },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E2E8F0",
    marginBottom: 4,
  },

  subtitle: {
    color: "#94A3B8",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#0B1220",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1E293B",
  },

  cardTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
  },

  cardSubtitle: {
    color: "#94A3B8",
    marginTop: 4,
    marginBottom: 14,
  },

  startButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  startButtonText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 16,
  },

  sectionTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  actionButton: {
    backgroundColor: "#0B1220",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#1E293B",
    marginBottom: 12,
  },

  actionText: {
    color: "#E2E8F0",
    fontSize: 16,
  },
});
