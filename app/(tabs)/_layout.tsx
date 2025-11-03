import { Stack } from 'expo-router';

export default function TabsStackLayout() {
  return (
    // Usamos um Stack Navigator para que as rotas filhas (home.tsx) se empilhem.
    <Stack>
      {/* O nome da rota é 'home' (correspondente a home.tsx) */}
      <Stack.Screen
        name="home"
        options={{
          title: '', // CRÍTICO: Define o título como vazio para remover o texto "home"
          headerShown: false, // CRÍTICO: Garante que o cabeçalho Stack seja invisível
        }}
      />
<<<<<<< HEAD
      {/* Adicione outras rotas aqui conforme necessário, se tiver 'explore.tsx' */}
      {/* <Stack.Screen name="explore" options={{ headerShown: false, title: '' }} /> */}
      
    </Stack>
=======
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Rotinas',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="dumbbell.fill" color={color} />,
        }}
      />
      <Tabs.Screen name="workouts" options={{ href: null }} />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
>>>>>>> origin/feat/exercicios-timer-sdk54
  );
}