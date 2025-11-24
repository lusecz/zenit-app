import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  seconds: number;
  title: string;
  onFinish: () => void;
}

export function ModalRestTimer({ visible, seconds, title, onFinish }: Props) {
  const [counter, setCounter] = useState(seconds);

  useEffect(() => {
    if (!visible) return;

    setCounter(seconds);

    const interval = setInterval(() => {
      setCounter((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimeout(onFinish, 300); // pequena animação
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, seconds]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.box}>

          <Ionicons name="time-outline" size={46} color="#22c55e" />

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.timer}>
            {String(counter).padStart(2, "0")}s
          </Text>

          <Text style={styles.sub}>
            Aguarde o descanso para prosseguir
          </Text>

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "78%",
    backgroundColor: "#0B1220",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E293B",
  },
  title: {
    color: "#E2E8F0",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 10,
  },
  timer: {
    fontSize: 42,
    color: "#22c55e",
    fontWeight: "700",
    marginVertical: 14,
  },
  sub: {
    color: "#94a3b8",
    fontSize: 14,
    textAlign: "center",
  },
});
