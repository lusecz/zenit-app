// /app/history.tsx
import React, { useContext, useEffect, useRef } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { WorkoutHistoryContext } from "@/context/WorkoutHistoryContext";

export default function HistoryScreen() {
  const { sessions } = useContext(WorkoutHistoryContext);

  // Animação: fade + slide-up
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={styles.title}>Histórico de Treinos</Text>

        {sessions.length === 0 && (
          <Text style={styles.empty}>Nenhum treino encontrado.</Text>
        )}

        {sessions.map((s) => (
          <Animated.View
            key={s.id}
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
              marginTop: 14,
            }}
          >
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{s.routineName}</Text>

              <Text style={styles.cardItem}>
                Tempo total:{" "}
                {Math.floor((s.duration ?? 0) / 60)} min
              </Text>

              <Text style={styles.cardItem}>
                Volume total: {s.totalVolume ?? 0} kg
              </Text>

              <Text style={styles.cardItem}>
                Séries concluídas: {s.totalSetsCompleted ?? 0}
              </Text>
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ----------------------------------
//             STYLES
// ----------------------------------

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },

  title: {
    color: "#22c55e",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },

  empty: { color: "#94a3b8", marginTop: 12 },

  card: {
    backgroundColor: "#0B1220",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#17212a",
  },

  cardTitle: {
    color: "#E2E8F0",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
  },

  cardItem: {
    color: "#94a3b8",
    marginTop: 4,
    fontSize: 14,
  },
});
