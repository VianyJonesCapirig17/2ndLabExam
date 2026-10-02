import { Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';

function RootNavigator() {
  const { token, authLoading } = useAuth();

  if (authLoading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color="#16803c" /></View>;
  }

  return (
    <Stack screenOptions={{ headerTintColor: '#173b2d' }}>
      <Stack.Protected guard={!token}>
        <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={Boolean(token)}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="student/[id]" options={{ title: 'Student Details' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return <AuthProvider><RootNavigator /></AuthProvider>;
}
