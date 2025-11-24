// app/_layout.tsx

import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { RoutineProvider } from "@/context/RoutineContext";
import { WorkoutProvider } from "@/context/WorkoutContext";
import { WorkoutHistoryProvider } from "@/context/WorkoutHistoryContext";
import { useColorScheme } from "@/hooks/useColorScheme";

import { AuthContext, AuthProvider } from "@/context/AuthContext";
import { useContext, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import Toast from "react-native-toast-message";
import { toastConfig } from "../toastConfig"; // <- arquivo que criamos

function NavigationDecider() {
  const { user, loading } = useContext(AuthContext);

  useEffect(() => {
    if (!loading) {
      if (user) router.replace("/(tabs)");
      else router.replace("/login");
    }
  }, [loading, user]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#22C55E" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) return null;

  return (
    <AuthProvider>
      <RoutineProvider>
        <WorkoutProvider>
          <WorkoutHistoryProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <NavigationDecider />
              <StatusBar style="auto" />

              {/* TOAST GLOBAL */}
              <Toast config={toastConfig} />
            </ThemeProvider>
          </WorkoutHistoryProvider>
        </WorkoutProvider>
      </RoutineProvider>
    </AuthProvider>
  );
}
