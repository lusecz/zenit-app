import AppLayout from "@/components/AppLayout";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function WorkoutFinish() {
  const router = useRouter();
  const { time } = useLocalSearchParams<{ time: string }>();

  const formatted = (() => {
    const t = Number(time ?? 0);
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  })();

  return (
    <AppLayout style={styles.container}>
      <Text style={styles.title}>🔥 Parabéns! Treino finalizado</Text>
      <Text style={styles.time}>Tempo total: {formatted}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/")}
      >
        <Text style={styles.buttonText}>Voltar ao início</Text>
      </TouchableOpacity>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  title: {
    color: "#22c55e",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 20
  },
  time: {
    color: "#E2E8F0",
    fontSize: 18,
    marginBottom: 40
  },
  button: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10
  },
  buttonText: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "700"
  }
});
