import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false,
      tabBarStyle: { display: "none" }   // <<< oculta a TabBar
    }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="routines" />
      <Tabs.Screen name="profile" />
      <Tabs.Screen name="workouts" />
    </Tabs>
  );
}
