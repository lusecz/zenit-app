import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router'; // Stack é o seu Navigator
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 1. NOVA TELA DE ENTRADA: DEVE SER A PRIMEIRA NA PILHA */}
        <Stack.Screen 
          name="welcome" // Corresponde ao arquivo 'app/welcome.tsx'
          options={{ 
            headerShown: false, // Oculta a barra de navegação padrão
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