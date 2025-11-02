import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        
        {/* 1. ROTA PRINCIPAL: AGORA APONTA PARA app/index.tsx */}
        <Stack.Screen 
          name="index" // <--- CORREÇÃO: Deve ser 'index' para a rota raiz
          options={{ 
            headerShown: false, // Oculta o cabeçalho "index"
          }} 
        />
        
        {/* 2. ROTAS PÓS-LOGIN: O GRUPO DE ABAS */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* 3. Rota de Erro */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}