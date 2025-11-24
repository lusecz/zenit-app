import React, { useContext, useMemo, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Modal,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { RoutineContext } from "@/context/RoutineContext";
import { WorkoutHistoryContext } from "@/context/WorkoutHistoryContext";

export default function HomeScreen() {
  const router = useRouter();
  const { routines } = useContext(RoutineContext);
  const { sessions } = useContext(WorkoutHistoryContext);

  const [modalVisible, setModalVisible] = useState(false);

  // última sessão (se houver) ou qualquer rotina disponível
  const routineToStart = useMemo(() => {
    if (sessions && sessions.length > 0) {
      const last = sessions[0];
      return routines.find((r) => r.id === last.routineId) || routines[0];
    }
    return routines[0];
  }, [sessions, routines]);

  const pulse = new Animated.Value(1);
  Animated.loop(
    Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 700, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1.0, duration: 700, useNativeDriver: true }),
    ])
  ).start();

  const openRoutineSelector = () => {
    if (routines.length === 0) {
      alert("Nenhuma rotina cadastrada ainda.");
      return;
    }
    setModalVisible(true);
  };

  const startRoutine = (routineId: string) => {
    setModalVisible(false);
    router.push({
      pathname: "/execute-workout",
      params: { routineId },
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/routines" as any)}>
          <Ionicons name="menu" size={28} color="#E2E8F0" />
        </TouchableOpacity>

        <Text style={styles.logo}>Zenit</Text>

        <TouchableOpacity onPress={() => router.push("/(tabs)/profile" as any)}>
          <Ionicons name="person-circle-outline" size={30} color="#E2E8F0" />
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <View style={styles.inner}>
        <Text style={styles.welcomeTitle}>Pronto para treinar hoje? 💪</Text>
        <Text style={styles.subtitle}>Escolha um treino e dê o seu melhor.</Text>

        {/* CARD PRINCIPAL */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Treino recomendado</Text>
          <Text style={styles.cardSubtitle}>
            {routineToStart ? routineToStart.name : "Nenhuma rotina cadastrada"}
          </Text>

          <Animated.View style={{ transform: [{ scale: pulse }], width: "100%" }}>
            <TouchableOpacity style={styles.startButton} onPress={openRoutineSelector}>
              <Text style={styles.startButtonText}>Iniciar treino</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* AÇÕES RÁPIDAS */}
        <Text style={styles.sectionTitle}>Ações rápidas</Text>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/exercise-library" as any)}
        >
          <Ionicons name="library-outline" size={22} color="#22c55e" />
          <Text style={styles.actionText}>Exercícios cadastrados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/routines" as any)}
        >
          <Ionicons name="construct-outline" size={22} color="#22c55e" />
          <Text style={styles.actionText}>Organizar treinos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/history" as any)}
        >
          <Ionicons name="bar-chart-outline" size={22} color="#22c55e" />
          <Text style={styles.actionText}>Histórico</Text>
        </TouchableOpacity>
      </View>

      {/* 📌 MODAL DE SELEÇÃO DE ROTINA */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Escolha uma rotina</Text>

            <ScrollView style={{ maxHeight: 300, width: "100%", marginTop: 12 }}>
              {routines.map((routine) => (
                <TouchableOpacity
                  key={routine.id}
                  style={styles.modalRoutineButton}
                  onPress={() => startRoutine(routine.id)}
                >
                  <Ionicons name="barbell-outline" size={22} color="#22c55e" />
                  <Text style={styles.modalRoutineText}>{routine.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#071026" },
  header: {
    height: 68,
    backgroundColor: "#081426",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1724",
  },
  logo: { color: "#22c55e", fontSize: 22, fontWeight: "800" },
  inner: { padding: 20 },
  welcomeTitle: { fontSize: 22, fontWeight: "700", color: "#E2E8F0", marginBottom: 4 },
  subtitle: { color: "#94A3B8", marginBottom: 20 },

  card: {
    backgroundColor: "#071025",
    padding: 16,
    borderRadius: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#0b1320",
  },
  cardTitle: { color: "#9AE6B4", fontSize: 14, fontWeight: "700" },
  cardSubtitle: { color: "#E2E8F0", marginTop: 6, marginBottom: 14, fontSize: 16 },

  startButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  startButtonText: { color: "#0F172A", fontWeight: "800", fontSize: 16 },

  sectionTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 14,
  },

  actionButton: {
    backgroundColor: "#081426",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0f1a28",
    marginBottom: 12,
  },
  actionText: { color: "#E2E8F0", fontSize: 16 },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "85%",
    backgroundColor: "#0B1220",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#17212a",
    padding: 20,
    alignItems: "center",
  },
  modalTitle: { color: "#E2E8F0", fontWeight: "800", fontSize: 18 },

  modalRoutineButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#071025",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#0f1724",
    marginBottom: 10,
  },
  modalRoutineText: {
    color: "#E2E8F0",
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "600",
  },

  modalCancel: {
    marginTop: 14,
    paddingVertical: 10,
  },
  modalCancelText: { color: "#94a3b8", fontSize: 16 },
});
