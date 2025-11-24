// app/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header minimalista */}
      <View style={styles.header}>
        <Ionicons name="fitness" size={28} color="#22c55e" />
        <Text style={styles.headerText}>ZenitApp</Text>
      </View>

      {/* Logo grande */}
      <View style={styles.hero}>
        <Ionicons
          name="barbell"
          size={94}
          color="#22c55e"
          style={{ marginBottom: 12 }}
        />
        <Text style={styles.title}>Bem-vindo ao ZenitApp</Text>
        <Text style={styles.subtitle}>Seu controle inteligente de treinos</Text>
      </View>

      {/* Ações */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.primaryBtnText}>Acessar</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>ou</Text>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => router.push("/register")}
        >
          <Text style={styles.secondaryBtnText}>Primeiro acesso</Text>
        </TouchableOpacity>
      </View>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2025 ZenitApp. Todos os direitos reservados.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 10,
  },

  headerText: {
    color: "#E2E8F0",
    fontSize: 20,
    fontWeight: "700",
    marginLeft: 10,
  },

  hero: {
    alignItems: "center",
    marginTop: 30,
  },

  title: {
    color: "#E2E8F0",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 10,
  },

  subtitle: {
    color: "#94a3b8",
    fontSize: 16,
    marginTop: 6,
  },

  buttonsContainer: {
    alignItems: "center",
    marginTop: 40,
  },

  primaryBtn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
  },

  primaryBtnText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 18,
  },

  orText: {
    color: "#94a3b8",
    marginVertical: 12,
    fontSize: 14,
  },

  secondaryBtn: {
    borderWidth: 2,
    borderColor: "#22c55e",
    paddingVertical: 14,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
  },

  secondaryBtnText: {
    color: "#22c55e",
    fontWeight: "700",
    fontSize: 18,
  },

  footer: {
    alignItems: "center",
    marginBottom: 20,
  },

  footerText: {
    color: "#94a3b8",
    fontSize: 12,
  },
});
