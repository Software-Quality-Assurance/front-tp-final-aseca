import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';
import React from 'react';
import { useColorScheme } from 'react-native';
import { Tabs } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider } from '@/hooks/useAuth';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'unspecified' ? 'light' : colorScheme;
  const colors = Colors[scheme];

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Tabs
          screenOptions={{
            tabBarPosition: 'left',
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
      </ThemeProvider>
    </AuthProvider>
  );
}
