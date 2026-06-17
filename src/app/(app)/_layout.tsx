import React from 'react';
import { useColorScheme } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  return <>{children}</>;
}

export default function AppLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'unspecified' ? 'light' : colorScheme;
  const colors = Colors[scheme];

  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          tabBarPosition: 'left',
          headerShown: false,
          tabBarStyle: { backgroundColor: colors.background },
          tabBarActiveTintColor: colors.text,
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Portfolio' }} />
        <Tabs.Screen
          name="current-value"
          options={{ title: 'Current Value' }}
        />
        <Tabs.Screen name="history" options={{ title: 'History' }} />
        <Tabs.Screen name="watchlist" options={{ title: 'Watchlist' }} />
        <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </AuthGuard>
  );
}
