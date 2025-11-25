import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';


interface ConfirmModalProps {
visible: boolean;
title?: string;
message: string;
onConfirm: () => void;
onCancel: () => void;
}


export function ConfirmModal({ visible, title = 'Confirmar', message, onConfirm, onCancel }: ConfirmModalProps) {
return (
<Modal visible={visible} transparent animationType="fade">
<View style={styles.overlay}>
<View style={styles.box}>
<Text style={styles.title}>{title}</Text>
<Text style={styles.message}>{message}</Text>
<View style={styles.actions}>
<TouchableOpacity style={[styles.button, styles.cancel]} onPress={onCancel}>
<Text style={styles.cancelText}>Cancelar</Text>
</TouchableOpacity>
<TouchableOpacity style={[styles.button, styles.confirm]} onPress={onConfirm}>
<Text style={styles.confirmText}>Confirmar</Text>
</TouchableOpacity>
</View>
</View>
</View>
</Modal>
);
}


const styles = StyleSheet.create({
overlay: {
flex: 1,
backgroundColor: 'rgba(0,0,0,0.6)',
justifyContent: 'center',
alignItems: 'center',
},
box: {
width: '86%',
backgroundColor: '#0f172a',
padding: 18,
borderRadius: 12,
borderWidth: 1,
borderColor: '#1f2937',
},
title: { color: '#E6E6E6', fontSize: 18, fontWeight: '700', marginBottom: 8 },
message: { color: '#94a3b8', fontSize: 14, marginBottom: 16 },
actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
button: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 },
cancel: { backgroundColor: '#334155', marginRight: 8 },
confirm: { backgroundColor: '#064e3b' },
cancelText: { color: '#e6e6e6', fontWeight: '600' },
confirmText: { color: '#22c55e', fontWeight: '700' },
});