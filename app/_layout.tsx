// app/_layout.tsx
import { Stack } from "expo-router";
import { RoutineProvider } from "@/context/RoutineContext";
import { WorkoutHistoryProvider } from "@/context/WorkoutHistoryContext";

export default function RootLayout() {
  return (
    <RoutineProvider>
      <WorkoutHistoryProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />          {/* Tela inicial */}
          <Stack.Screen name="first-access" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </WorkoutHistoryProvider>
    </RoutineProvider>
  );
}
