import { Tabs } from 'expo-router';

export default function AppLayout() {
  // The root navigator waits for restoration and guards this route group.
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#16803c',
      headerTintColor: '#173b2d',
      headerShown: false,
      tabBarIconStyle: { display: 'none' },
      tabBarStyle: { height: 78, paddingTop: 9, paddingBottom: 9, backgroundColor: '#ffffff', borderTopColor: '#e4ece5', borderTopWidth: 1, elevation: 12 },
      tabBarItemStyle: { paddingVertical: 6 },
      tabBarLabelStyle: { fontSize: 16, fontWeight: '700' },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="students" options={{ title: 'Students' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
