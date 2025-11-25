import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";

// Mobile (iOS/Android)
import LottieMobile from "lottie-react-native";
// Web
import LottieWeb from "lottie-react";

import confetti from "@/assets/lottie/confetti.json";

export default function ResultScreen() {
  const router = useRouter();
  const { data } = useLocalSearchParams<{ data: string }>();

  const result = data ? JSON.parse(data) : null;

  const animationRef = useRef<any>(null);

  useEffect(() => {
    animationRef.current?.play?.();
  }, []);

  return (
    <SafeAreaView style={styles.container}>

      {/* CONFETTI */}
      {Platform.OS === "web" ? (
        <LottieWeb
          animationData={confetti}
          autoplay
          loop={false}
          style={styles.confetti}
        />
      ) : (
        <LottieMobile
          ref={animationRef}
          source={confetti}
          autoPlay
          loop={false}
          style={styles.confetti}
        />
      )}

      <View style={styles.card}>
        <Ionicons name="trophy" size={52} color="#22c55e" style={{ marginBottom: 16 }} />

        <Text style={styles.title}>Parabéns!</Text>
        <Text style={styles.subtitle}>Você finalizou o treino</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Rotina:</Text>
          <Text style={styles.infoValue}>{result?.routineName}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Tempo total:</Text>
          <Text style={styles.infoValue}>{result?.totalTime}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Exercícios concluídos:</Text>
          <Text style={styles.infoValue}>{result?.totalExercises}</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>Total de séries:</Text>
          <Text style={styles.infoValue}>{result?.totalSets}</Text>
        </View>

        <View style={{ height: 20 }} />

        <TouchableOpacity
            style={styles.btnPrimary}
            onPress={() => router.push("/history")}
            >
            <Text style={styles.btnPrimaryText}>Ver histórico</Text>
            </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/routines")}
        >
          <Text style={styles.btnSecondaryText}>Voltar para rotinas</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  confetti: {
    position: "absolute",
    width: "120%",
    height: "120%",
    top: -40,
    left: -20,
    zIndex: 5,
    pointerEvents: "none",
  },

  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "#0B1220",
    borderRadius: 14,
    padding: 22,
    borderWidth: 1,
    borderColor: "#17212a",
    alignItems: "center",
    zIndex: 10,
  },

  title: {
    color: "#E2E8F0",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 6,
  },

  subtitle: { color: "#94a3b8", marginBottom: 20 },

  infoBox: { width: "100%", marginBottom: 12 },

  infoLabel: { color: "#94a3b8", fontSize: 14 },

  infoValue: { color: "#E2E8F0", fontSize: 18, fontWeight: "700" },

  btnPrimary: {
    backgroundColor: "#22c55e",
    padding: 14,
    width: "100%",
    borderRadius: 10,
    alignItems: "center",
  },

  btnPrimaryText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 16,
  },

  btnSecondary: {
    marginTop: 12,
    padding: 14,
    width: "100%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#17323a",
    alignItems: "center",
  },

  btnSecondaryText: {
    color: "#22c55e",
    fontWeight: "600",
    fontSize: 16,
  },
});
