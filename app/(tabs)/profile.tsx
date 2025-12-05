// app/(tabs)/profile.tsx
import AppLayout from "@/components/AppLayout";
import { AuthContext } from "@/context/AuthContext";
import { logout } from "@/services/auth";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useContext } from "react";
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.log("Erro ao fazer logout:", error);
    }
  };

  return (
    <AppLayout style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#E2E8F0" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Ionicons name="person-circle" size={80} color="#22c55e" />
          <Text style={styles.email}>{user?.email || "Usuário"}</Text>
        </View>

        <View style={styles.options}>
          <TouchableOpacity style={styles.option}>
            <Ionicons name="settings" size={24} color="#94a3b8" />
            <Text style={styles.optionText}>Configurações</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option}>
            <Ionicons name="help-circle" size={24} color="#94a3b8" />
            <Text style={styles.optionText}>Ajuda</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.option}>
            <Ionicons name="information-circle" size={24} color="#94a3b8" />
            <Text style={styles.optionText}>Sobre</Text>
          </TouchableOpacity>
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#071026",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#0f1724",
  },
  title: {
    color: "#22c55e",
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 40,
  },
  email: {
    color: "#E2E8F0",
    fontSize: 16,
    marginTop: 12,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#0B1220",
    borderRadius: 10,
    gap: 12,
  },
  optionText: {
    color: "#E2E8F0",
    fontSize: 16,
  },
});