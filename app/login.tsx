import AppLayout from "@/components/AppLayout";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import Toast from "react-native-toast-message";
import { login } from "../services/auth";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Campos vazios",
        text2: "Preencha email e senha.",
      });
      return;
    }

    setLoading(true);

    try {
      await login(email, password);

      Toast.show({
        type: "success",
        text1: "Login realizado",
        text2: "Bem-vindo de volta!",
      });

      router.replace("/(tabs)");
    } catch (error: any) {
      let message = "Ocorreu um erro inesperado.";

      switch (error.code) {
        case "auth/invalid-email":
          message = "E-mail inválido.";
          break;
        case "auth/wrong-password":
          message = "Senha incorreta.";
          break;
        case "auth/user-not-found":
          message = "Usuário não encontrado.";
          break;
        case "auth/network-request-failed":
          message = "Falha de conexão.";
          break;
        default:
          message = error.code ?? message;
      }

      Toast.show({
        type: "error",
        text1: "Erro no login",
        text2: message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout style={styles.container}>
      {/* Logo */}
      <View style={styles.logoBox}>
        <Image
          source={require("@/assets/images/zenit_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Zenit</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Entrar</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor="#94a3b8"
          style={styles.input}
          autoCapitalize="none"
          onChangeText={setEmail}
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor="#94a3b8"
          secureTextEntry
          style={styles.input}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>
            {loading ? "Carregando..." : "Acessar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/register")}>
          <Text style={styles.link}>Criar conta</Text>
        </TouchableOpacity>
      </View>

      <Toast />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#071026",
    paddingHorizontal: 24,
    justifyContent: "center",
  },

  logoBox: {
    alignItems: "center",
    marginBottom: 30,
  },

  logo: {
    width: 80,
    height: 80,
  },

  appName: {
    marginTop: 10,
    color: "#22c55e",
    fontSize: 24,
    fontWeight: "800",
  },

  card: {
    backgroundColor: "#081426",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#0f1724",
  },

  title: {
    fontSize: 24,
    color: "#E2E8F0",
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#071025",
    borderWidth: 1,
    borderColor: "#0f1724",
    padding: 14,
    borderRadius: 10,
    color: "#E2E8F0",
    fontSize: 16,
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
  },

  buttonText: {
    color: "#0F172A",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "800",
  },

  link: {
    color: "#22c55e",
    marginTop: 18,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
});
