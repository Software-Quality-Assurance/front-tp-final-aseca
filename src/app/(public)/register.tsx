import React, { useState, useCallback } from 'react'
import { Link, useRouter, useFocusEffect } from 'expo-router'
import { Button, TextInput, View } from 'react-native'
import { useAuth } from '@/hooks/useAuth'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/hooks/use-theme'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const theme = useTheme()

  useFocusEffect(
    useCallback(() => {
      setSuccess(null)
      setError(null)
    }, []),
  )

  async function onSubmit() {
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      await register(email.trim().toLowerCase(), password)
      setSuccess('Account created. You can now log in.')
      setTimeout(() => router.push('/login'), 1200)
    } catch (e: any) {
      setError(e.message ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView testID="register-screen" className="flex-1 p-4 justify-center items-stretch">
      <ThemedText className="text-2xl mb-3">Register</ThemedText>
      {error ? <ThemedText className="text-red-500 mb-2">{error}</ThemedText> : null}
      {success ? <ThemedText className="text-green-500 mb-2">{success}</ThemedText> : null}
      <TextInput
        testID="register-email-input"
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
        testID="register-password-input"
        placeholder="Password (min 8 chars)"
        placeholderTextColor={theme.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="w-full min-h-[44px] border rounded-md px-3 py-2 my-2"
        style={{ backgroundColor: theme.backgroundElement, color: theme.text, borderColor: theme.backgroundSelected }}
      />
      <Button title={loading ? 'Creating...' : 'Create account'} onPress={onSubmit} disabled={loading} />
      <View className="flex-row mt-3 items-center flex-wrap">
        <ThemedText>Already have an account? </ThemedText>
        <Link href="/login">
          <ThemedText type="linkPrimary">Login</ThemedText>
        </Link>
      </View>
    </ThemedView>
  )
}
