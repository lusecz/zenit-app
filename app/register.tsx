// app/register.tsx
import AppLayout from "@/components/AppLayout";
import { router } from "expo-router";
import type { AuthError } from "firebase/auth";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  View,
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
        text2: "Bem-vindo ao ZenitApp!",
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
        text1: "Erro no cadastro",
        text2: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppLayout style={styles.container}>
      {/* LOGO */}
      <View style={styles.logoBox}>
        <Image
          source={require("../assets/images/zenit_logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>ZenitApp</Text>
      </View>

      {/* TÍTULO */}
      <Text style={styles.title}>Criar conta</Text>

      {/* INPUTS */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#9ca3af"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#9ca3af"
        secureTextEntry
        style={styles.input}
        onChangeText={setPassword}
      />

      {/* BOTÃO */}
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>
          {loading ? "Criando..." : "Registrar"}
        </Text>
      </TouchableOpacity>

      {/* LINK */}
      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Text style={styles.link}>Já tenho conta</Text>
      </TouchableOpacity>

      <Toast />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#071026",
    padding: 20,
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
    marginTop: 8,
    fontSize: 20,
    fontWeight: "800",
    color: "#22c55e",
  },

  title: {
    fontSize: 28,
    color: "#E2E8F0",
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    backgroundColor: "#081426",
    borderWidth: 1,
    borderColor: "#0f1a28",
    padding: 14,
    borderRadius: 12,
    color: "#E2E8F0",
    fontSize: 16,
    marginBottom: 14,
  },

  button: {
    backgroundColor: "#22c55e",
    padding: 14,
    borderRadius: 12,
    marginTop: 6,
  },

  buttonText: {
    color: "#0F172A",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "800",
  },

  link: {
    color: "#22c55e",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
