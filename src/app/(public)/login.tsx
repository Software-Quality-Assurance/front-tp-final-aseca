import React, { useState } from 'react'
import { Link, useRouter } from 'expo-router'
import { Button, TextInput, View } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/hooks/use-theme'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const theme = useTheme()

  async function onSubmit() {
    setError(null)
    setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      router.replace('/profile')
    } catch (e: any) {
      setError(e.message ?? 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView testID="login-screen" className="flex-1 p-4 justify-center items-stretch">
      <ThemedText className="text-2xl mb-3">Login</ThemedText>
      {error ? <ThemedText className="text-red-500 mb-2">{error}</ThemedText> : null}
      <TextInput
        testID="login-email-input"
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        value={email}
        onChangeText={setEmail}
        className="w-full min-h-[44px] border rounded-md px-3 py-2 my-2"
        style={{ backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.backgroundSelected }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        testID="login-password-input"
        placeholder="Password"
        placeholderTextColor={theme.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full min-h-[44px] border rounded-md px-3 py-2 my-2"
        style={{ backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.backgroundSelected }}
      />
      <Button title={loading ? 'Logging in...' : 'Login'} onPress={onSubmit} disabled={loading} />
      <View className="flex-row mt-3 items-center flex-wrap">
        <ThemedText>{"Don't have an account? "}</ThemedText>
        <Link href="/register">
          <ThemedText type="linkPrimary">Register</ThemedText>
        </Link>
      </View>
    </ThemedView>
  )
}
