// components/AppLayout.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AppLayoutProps {
  children: React.ReactNode;
  backgroundColor?: string;
  style?: any;
  edges?: ('top' | 'right' | 'bottom' | 'left')[];
}

export default function AppLayout({ 
  children, 
  backgroundColor = '#000', 
  style,
  edges = ['top', 'left', 'right']
}: AppLayoutProps) {
  
  return (
    <SafeAreaView 
      style={[
        styles.container, 
        { backgroundColor },
        style
      ]}
      edges={edges}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});