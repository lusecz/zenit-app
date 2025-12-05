// app/first-acess.tsx
import AppLayout from "@/components/AppLayout";
import { useRouter } from "expo-router";
import React from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from "react-native";

export default function FirstAccessScreen() {
  const router = useRouter();

  return (
    <AppLayout style={styles.container}>
      <Text style={styles.title}>Primeiro Acesso</Text>
      <Text style={styles.subtitle}>
        Bem-vindo ao ZenitApp! Configure sua conta para começar.
      </Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => router.replace("/register")}
      >
        <Text style={styles.buttonText}>Começar</Text>
      </TouchableOpacity>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: "#22c55e",
    fontWeight: "700",
    marginBottom: 16,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    backgroundColor: "#22C55E",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});