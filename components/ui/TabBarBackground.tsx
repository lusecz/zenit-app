import { View, StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return <View style={styles.background} />;
}

const styles = StyleSheet.create({
  background: {
    flex: 1,  
    marginTop: -2,
    backgroundColor: '#0F172A',
  },
});