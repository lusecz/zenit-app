// zenit_app/components/AppLayout.tsx

import React from 'react';
import { View, StyleSheet, StatusBar, Text, Image, ScrollView } from 'react-native';
import { theme } from '../constants/theme';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={theme.colors.primary} barStyle="light-content" />

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Image
          source={require('../assets/images/zenit_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Conteúdo rolável */}
      <ScrollView contentContainerStyle={styles.content}>
        {children}
      </ScrollView>

      {/* Rodapé */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 ZenitApp. Todos os direitos reservados.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.primary,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  logo: {
    width: 140,
    height: 50,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    backgroundColor: theme.colors.secondary,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: theme.colors.lightText,
    fontSize: 12,
  },
});
