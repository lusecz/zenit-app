import AppLayout from "@/components/AppLayout";
import { ConfirmModal } from "@/components/ConfirmModal";
import Toast from "@/components/Toast";
import { RoutineContext } from "@/context/RoutineContext";
import { isValidName, sanitizeNumber } from "@/helpers/validators";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useContext, useMemo, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function EditRoutineScreen() {
  const { routineId } = useLocalSearchParams<{ routineId?: string }>();
  const router = useRouter();

  const {
    getRoutine,
    addExercise,
    updateExercise,
    removeExercise,
    addSet,
    updateSet,
    removeSet,
    updateExerciseRestTime,
  } = useContext(RoutineContext);

  const routine = useMemo(
    () => (routineId ? getRoutine(routineId) : undefined),
    [routineId, getRoutine]
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [editingExercise, setEditingExercise] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDelete, setToDelete] = useState<{
    kind: "exercise" | "set";
    exId: string;
    setId?: string;
  } | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  if (!routine) {
    return (
      <AppLayout style={styles.container}>
        <Text style={styles.errorText}>Rotina não encontrada.</Text>
      </AppLayout>
    );
  }

  const handleAddExercise = () => {
    if (!isValidName(newExerciseName)) {
      showToast("Nome inválido");
      return;
    }
    const res = addExercise(routine.id, newExerciseName);
    showToast(res.message);
    if (res.success) {
      setNewExerciseName("");
      setModalVisible(false);
    }
  };

  const startEditExercise = (ex: any) => {
    setEditingExercise(ex);
    setNewExerciseName(ex.name);
    setModalVisible(true);
  };

  const applyEditExercise = () => {
    if (!editingExercise) return;
    if (!isValidName(newExerciseName)) {
      showToast("Nome inválido");
      return;
    }
    const res = updateExercise(
      routine.id,
      editingExercise.id,
      newExerciseName
    );
    showToast(res.message);
    if (res.success) {
      setModalVisible(false);
      setEditingExercise(null);
      setNewExerciseName("");
    }
  };

  const confirmDeleteExercise = (exId: string) => {
    setToDelete({ kind: "exercise", exId });
    setConfirmVisible(true);
  };

  const confirmDeleteSet = (exId: string, setId: string) => {
    setToDelete({ kind: "set", exId, setId });
    setConfirmVisible(true);
  };

  const doDelete = () => {
    if (!toDelete) return;

    if (toDelete.kind === "exercise") {
      const res = removeExercise(routine.id, toDelete.exId);
      showToast(res.message);
    } else {
      const res = removeSet(routine.id, toDelete.exId, toDelete.setId!);
      showToast(res.message);
    }

    setConfirmVisible(false);
    setToDelete(null);
  };

  return (
    <AppLayout style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="arrow-back-circle"
            size={28}
            color="#94a3b8"
          />
        </TouchableOpacity>

        <Text style={styles.title}>{routine.name}</Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/exercise-library",
                params: { routineId: routine.id },
              } as any)
            }
          >
            <Ionicons
              name="library-outline"
              size={26}
              color="#38bdf8"
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons
              name="add-circle"
              size={26}
              color="#22c55e"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView style={styles.content}>
        {routine.exercises.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>
              Nenhum exercício adicionado.
            </Text>
          </View>
        ) : (
          routine.exercises.map((ex) => (
            <View key={ex.id} style={styles.exerciseCard}>
              {/* EX HEADER */}
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseTitle}>{ex.name}</Text>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  <TouchableOpacity onPress={() => startEditExercise(ex)}>
                    <Ionicons
                      name="create-outline"
                      size={20}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => confirmDeleteExercise(ex.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#f43f5e"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* REST */}
              <View style={styles.restRow}>
                <Text style={styles.restLabel}>Descanso (s):</Text>
                <TextInput
                  keyboardType="numeric"
                  defaultValue={String(ex.restTime ?? 60)}
                  onEndEditing={(e) =>
                    updateExerciseRestTime(
                      routine.id,
                      ex.id,
                      sanitizeNumber(e.nativeEvent.text, 60)
                    )
                  }
                  style={styles.restInput}
                />
              </View>

              {/* SETS */}
              {ex.sets.map((s: any, idx: number) => (
                <View key={s.id} style={styles.setRow}>
                  <Text style={styles.setNumber}>{idx + 1}</Text>

                  {/* PESO */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Peso (kg)</Text>
                    <TextInput
                      keyboardType="numeric"
                      defaultValue={String(s.weight ?? 0)}
                      onEndEditing={(e) =>
                        updateSet(
                          routine.id,
                          ex.id,
                          s.id,
                          s.reps,
                          sanitizeNumber(e.nativeEvent.text, 0)
                        )
                      }
                      style={styles.smallInput}
                    />
                  </View>

                  {/* REPS */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      keyboardType="numeric"
                      defaultValue={String(s.reps ?? 0)}
                      onEndEditing={(e) =>
                        updateSet(
                          routine.id,
                          ex.id,
                          s.id,
                          sanitizeNumber(e.nativeEvent.text, 0),
                          s.weight
                        )
                      }
                      style={styles.smallInput}
                    />
                  </View>

                  <TouchableOpacity
                    onPress={() => confirmDeleteSet(ex.id, s.id)}
                  >
                    <Ionicons
                      name="remove-circle-outline"
                      size={22}
                      color="#94a3b8"
                    />
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={styles.addSetBtn}
                onPress={() => addSet(routine.id, ex.id)}
              >
                <Ionicons name="add" size={18} color="#22c55e" />
                <Text style={styles.addSetText}>Adicionar Série</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>
              {editingExercise ? "Editar Exercício" : "Novo Exercício"}
            </Text>

            <TextInput
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="Nome do exercício"
              placeholderTextColor="#94a3b8"
              style={styles.input}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setEditingExercise(null);
                  setNewExerciseName("");
                }}
                style={styles.modalCancel}
              >
                <Text style={{ color: "#E6E6E6" }}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  editingExercise
                    ? applyEditExercise
                    : handleAddExercise
                }
                style={styles.modalConfirm}
              >
                <Text style={{ color: "#fff" }}>
                  {editingExercise ? "Salvar" : "Adicionar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmVisible}
        message="Confirma exclusão?"
        onConfirm={doDelete}
        onCancel={() => setConfirmVisible(false)}
      />

      <Toast visible={toastVisible} message={toastMessage} />
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#071026" },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#081426",
  },

  title: { color: "#22C55E", fontWeight: "700", fontSize: 18 },

  content: { padding: 12 },

  errorText: { color: "#F43F5E", padding: 16 },

  empty: { padding: 24, alignItems: "center" },
  emptyText: { color: "#94A3B8" },

  exerciseCard: {
    backgroundColor: "#0B1220",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  exerciseTitle: { color: "#E2E8F0", fontWeight: "700" },

  restRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  restLabel: { color: "#94A3B8" },

  restInput: {
    width: 90,
    backgroundColor: "#071025",
    color: "#E2E8F0",
    padding: 8,
    borderRadius: 6,
  },

  setRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    marginBottom: 8,
  },

  setNumber: {
    color: "#94A3B8",
    width: 28,
    textAlign: "center",
  },

  inputGroup: {
    alignItems: "center",
  },

  inputLabel: {
    color: "#94A3B8",
    fontSize: 11,
    marginBottom: 2,
  },

  smallInput: {
    width: 84,
    backgroundColor: "#071025",
    color: "#E2E8F0",
    padding: 8,
    borderRadius: 6,
  },

  addSetBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#081322",
    justifyContent: "center",
  },

  addSetText: { color: "#22C55E" },

  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  modalBox: {
    width: "88%",
    backgroundColor: "#0B1220",
    borderRadius: 12,
    padding: 16,
  },

  modalTitle: {
    color: "#E2E8F0",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },

  input: {
    backgroundColor: "#071025",
    color: "#E6E6E6",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },

  modalCancel: { padding: 10 },

  modalConfirm: {
    backgroundColor: "#22C55E",
    padding: 10,
    borderRadius: 8,
  },
});
