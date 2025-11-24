import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';


interface ToastProps {
visible: boolean;
message: string;
}


export default function Toast({ visible, message }: ToastProps) {
const opacity = React.useRef(new Animated.Value(0)).current;


useEffect(() => {
if (visible) {
Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
const t = setTimeout(() => {
Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
}, 2800);
return () => clearTimeout(t);
}
}, [visible]);


if (!message) return null;


return (
<Animated.View pointerEvents="none" style={[styles.container, { opacity }]}>
<View style={styles.bubble}>
<Text style={styles.text}>{message}</Text>
</View>
</Animated.View>
);
}


const styles = StyleSheet.create({
container: {
position: 'absolute',
bottom: 40,
left: 20,
right: 20,
alignItems: 'center',
},
bubble: {
backgroundColor: '#111827',
paddingHorizontal: 16,
paddingVertical: 12,
borderRadius: 10,
minWidth: 120,
alignItems: 'center',
},
text: {
color: '#E6E6E6',
fontSize: 14,
},
});