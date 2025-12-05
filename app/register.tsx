// app/register.tsx
import AppLayout from "@/components/AppLayout";
import { router } from "expo-router";
import type { AuthError } from "firebase/auth";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
} from "react-native";
import Toast from "react-native-toast-message";
import { register } from "../services/auth";

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios",
        text2: "Preencha email e senha.",
      });
      return;
    }

    setLoading(true);

    try {
      await register(email, password);

      Toast.show({
        type: "success",
        text1: "Conta criada",
        text2: "Bem-vindo ao app!",
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      const authError = error as AuthError;

      let msg = "Erro ao criar conta.";

      switch (authError.code) {
        case "auth/email-already-in-use":
          msg = "Este email já está em uso.";
          break;

        case "auth/invalid-email":
          msg = "O formato do email é inválido.";
          break;

        case "auth/operation-not-allowed":
          msg = "Este tipo de login não está habilitado no Firebase.";
          break;

        case "auth/weak-password":
          msg = "A senha deve ter pelo menos 6 caracteres.";
          break;

        case "auth/network-request-failed":
          msg = "Falha de conexão. Verifique sua internet.";
          break;

        default:
          msg = authError.message;
      }

      Toast.show({
        type: "error",
        text1: "Erro no registro",
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#ccc"
        style={styles.input}
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#ccc"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>
          {loading ? "Criando..." : "Registrar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Text style={styles.link}>Já tenho conta</Text>
      </TouchableOpacity>

      {/* Componente necessário para mostrar os toasts */}
      <Toast />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#000",
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "#444",
    padding: 15,
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#22C55E",
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  link: {
    color: "#22C55E",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
