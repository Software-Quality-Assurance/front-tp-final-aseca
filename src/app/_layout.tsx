import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import React from 'react'
import { useColorScheme } from 'react-native'
import { Stack } from 'expo-router'
import { AuthProvider } from '@/hooks/useAuth'
import { AnimatedSplashOverlay } from '@/components/animated-icon'

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </AuthProvider>
  )
}
