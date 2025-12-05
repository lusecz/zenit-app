// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
    Animated,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import AppLayout from "@/components/AppLayout";
import { RoutineContext } from "@/context/RoutineContext";
import { WorkoutHistoryContext } from "@/context/WorkoutHistoryContext";
import { logout } from "@/services/auth";

export default function HomeScreen() {
  const router = useRouter();
  const { routines = [] } = useContext(RoutineContext) as any;
  const { sessions = [] } = useContext(WorkoutHistoryContext) as any;

  const [modalVisible, setModalVisible] = useState(false);

  // Pulse animation
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1.0,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  // safe routine selection
  const routineToStart = useMemo(() => {
    try {
      if (!sessions || sessions.length === 0) return routines?.[0] ?? null;
      const last = sessions[0];
      const matched = routines.find((r: any) => r.id === last.routineId);
      return matched ?? routines?.[0] ?? null;
    } catch {
      return routines?.[0] ?? null;
    }
  }, [sessions, routines]);

  const openRoutineSelector = () => {
    if (!routines || routines.length === 0) {
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

  async function handleLogout() {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.log("Erro ao fazer logout:", error);
    }
  }

  return (
    <AppLayout style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/routines" as any)}>
          <Ionicons name="menu" size={26} color="#E2E8F0" />
        </TouchableOpacity>

        <Text style={styles.logo}>Zenit</Text>

        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={30} color="#E2E8F0" />
        </TouchableOpacity>
      </View>

      {/* Main content: top + bottom (actions pushed downward) */}
      <View style={styles.content}>
        <View style={styles.topSection}>
          <Text style={styles.welcomeTitle}>Pronto para treinar hoje? 💪</Text>
          <Text style={styles.subtitle}>
            O foco e a consistência te levam mais longe.
          </Text>

          <View style={styles.recommendCard}>
            <View style={styles.recommendHeader}>
              <Text style={styles.cardTitle}>Treino recomendado</Text>
              <Ionicons name="star" size={18} color="#9AE6B4" />
            </View>

            <Text style={styles.cardSubtitle}>
              {routineToStart?.name ?? "Nenhuma rotina cadastrada"}
            </Text>

            <Animated.View
              style={{ transform: [{ scale: pulse }], width: "100%" }}
            >
              <TouchableOpacity
                style={styles.startButton}
                onPress={openRoutineSelector}
              >
                <Ionicons name="play" size={18} color="#0F172A" />
                <Text style={styles.startButtonText}>Iniciar treino</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* bottomSection com ações rápidas — mais abaixo na tela */}
        <View style={styles.bottomSection}>
          <Text style={styles.sectionTitle}>Ações rápidas</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/exercise-library" as any)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="library-outline" size={20} color="#22c55e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionText}>Exercícios cadastrados</Text>
              <Text style={styles.actionSub}>Procure aulas e vídeos</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/routines" as any)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="construct-outline" size={20} color="#22c55e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionText}>Organizar treinos</Text>
              <Text style={styles.actionSub}>Criar / editar rotinas</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/history" as any)}
          >
            <View style={styles.iconWrap}>
              <Ionicons name="bar-chart-outline" size={20} color="#22c55e" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionText}>Histórico</Text>
              <Text style={styles.actionSub}>Acompanhe seu progresso</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal seleção de rotina */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Escolha uma rotina</Text>

            <ScrollView
              style={{ maxHeight: 300, width: "100%", marginTop: 12 }}
            >
              {(routines ?? []).map((routine: any) => (
                <TouchableOpacity
                  key={routine.id}
                  style={styles.modalRoutineButton}
                  onPress={() => startRoutine(routine.id)}
                >
                  <Ionicons name="barbell-outline" size={18} color="#22c55e" />
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
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#071026",
  },

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
  logo: { color: "#22c55e", fontSize: 20, fontWeight: "800" },

  content: {
    flex: 1,
    padding: 20,
    // dividimos espaço entre top e bottom para empurrar ações para baixo
    justifyContent: "space-between",
  },

  topSection: {
    // conteúdo superior ficará natural no topo
  },

  welcomeTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#E2E8F0",
    marginBottom: 4,
  },
  subtitle: { color: "#94A3B8", marginBottom: 14 },

  // Card com leve efeito glass
  recommendCard: {
    backgroundColor: Platform.OS === "web" ? "rgba(11,18,32,0.85)" : "#071025",
    borderRadius: 14,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(23,36,42,0.6)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  recommendHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: { color: "#9AE6B4", fontSize: 13, fontWeight: "700" },
  cardSubtitle: {
    color: "#E2E8F0",
    marginTop: 4,
    marginBottom: 12,
    fontSize: 16,
  },

  startButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
  },
  startButtonText: {
    color: "#0F172A",
    fontWeight: "800",
    fontSize: 16,
    marginLeft: 8,
  },

  // bottom section (ações rápidas) mais abaixo
  bottomSection: {
    // empurra para baixo visualmente
  },
  sectionTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  actionButton: {
    backgroundColor: "#081426",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0f1a28",
    marginBottom: 12,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "rgba(34,197,94,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  actionText: { color: "#E2E8F0", fontSize: 16, fontWeight: "700" },
  actionSub: { color: "#94a3b8", fontSize: 12 },

  // Modal
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
    padding: 18,
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

  modalCancel: { marginTop: 10, paddingVertical: 10 },
  modalCancelText: { color: "#94a3b8", fontSize: 16 },
});
