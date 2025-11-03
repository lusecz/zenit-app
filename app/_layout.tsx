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
        
        {/* 1. ROTA PRINCIPAL: Tela de Boas-Vindas */}
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: false, 
          }} 
        />
        
        {/* 2. ROTA DE LOGIN */}
        <Stack.Screen 
          name="login" // CRÍTICO: Rota para app/login.tsx
          options={{ 
            headerShown: false, 
          }} 
        />
        
        {/* 3. ROTA DE CADASTRO */}
        <Stack.Screen 
          name="cadastro" // CRÍTICO: Rota para app/cadastro.tsx
          options={{ 
            headerShown: false, 
          }} 
        />
        
        {/* 4. ROTA DA LISTAGEM DE EXERCÍCIOS */}
        <Stack.Screen 
          name="exercise-list" 
          options={{ 
            headerShown: false, 
          }} 
        />

        {/* 5. ROTAS PÓS-LOGIN: O GRUPO DE ABAS */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* 6. Rota de Erro */}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
