import AppLayout from "@/components/AppLayout";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity
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
      console.log("Erro Firebase:", error);

      let message = "Ocorreu um erro inesperado. Tente novamente.";

      switch (error.code) {
        case "auth/invalid-email":
          message = "E-mail inválido. Verifique o formato.";
          break;

        case "auth/missing-email":
          message = "Digite um e-mail para continuar.";
          break;

        case "auth/missing-password":
          message = "Digite sua senha.";
          break;

        case "auth/invalid-credential":
          message = "Credenciais inválidas. Verifique e-mail e senha.";
          break;

        case "auth/wrong-password":
          message = "Senha incorreta.";
          break;

        case "auth/user-not-found":
          message = "Nenhuma conta encontrada com este e-mail.";
          break;

        case "auth/user-disabled":
          message = "Esta conta foi desativada.";
          break;

        case "auth/too-many-requests":
          message = "Muitas tentativas. Tente novamente mais tarde.";
          break;

        case "auth/network-request-failed":
          message = "Falha de conexão. Verifique sua internet.";
          break;

        default:
          message = "Erro desconhecido: " + error.code;
          break;
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
      <Text style={styles.title}>Entrar</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#ccc"
        style={styles.input}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#ccc"
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

      {/* Necessário para Toast funcionar */}
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
