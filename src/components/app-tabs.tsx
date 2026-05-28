import React from 'react';
import { useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';

import { Colors } from '@/constants/theme';

// Use the cross-platform Tabs component from expo-router so routes work on web and native.
export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.text,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
      <Tabs.Screen name="login" options={{ title: 'Login' }} />
      <Tabs.Screen name="register" options={{ title: 'Register' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
