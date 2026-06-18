import React from 'react';
import { useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

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
        <Tabs.Screen
          name="index"
          options={{
            title: 'Portfolio',
            tabBarButtonTestID: 'tab-portfolio',
            tabBarAccessibilityLabel: 'tab-portfolio',
          }}
        />
        <Tabs.Screen
          name="current-value"
          options={{
            title: 'Current Value',
            tabBarButtonTestID: 'tab-current-value',
            tabBarAccessibilityLabel: 'tab-current-value',
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarButtonTestID: 'tab-history',
            tabBarAccessibilityLabel: 'tab-history',
          }}
        />
        <Tabs.Screen
          name="watchlist"
          options={{
            title: 'Watchlist',
            tabBarButtonTestID: 'tab-watchlist',
            tabBarAccessibilityLabel: 'tab-watchlist',
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarButtonTestID: 'tab-explore',
            tabBarAccessibilityLabel: 'tab-explore',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarButtonTestID: 'tab-profile',
            tabBarAccessibilityLabel: 'tab-profile',
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
