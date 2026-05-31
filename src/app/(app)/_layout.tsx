import React, { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { Tabs, useRouter } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import { Colors } from '@/constants/theme'

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
  }, [user, loading])

  if (loading) return null

  return <>{children}</>
}

export default function AppLayout() {
  const colorScheme = useColorScheme()
  const scheme = colorScheme === 'unspecified' ? 'light' : colorScheme
  const colors = Colors[scheme]

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
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </AuthGuard>
  )
}
