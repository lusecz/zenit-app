import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router'; // Stack é o seu Navigator
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { RoutineProvider } from '@/context/RoutineContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { WorkoutHistoryProvider } from '@/context/WorkoutHistoryContext';
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
    <RoutineProvider>
      <WorkoutProvider>
        <WorkoutHistoryProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="edit-routine" options={{ headerShown: false }} />
              <Stack.Screen name="execute-workout" options={{ headerShown: false }} />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </WorkoutHistoryProvider>
      </WorkoutProvider>
    </RoutineProvider>
  );
}