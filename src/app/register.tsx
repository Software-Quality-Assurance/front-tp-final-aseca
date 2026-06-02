import React, { useState, useCallback } from 'react';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { Button, TextInput, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { styles, themedInput } from '@/styles/register.styles';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useFocusEffect(
    useCallback(() => {
      // Clear messages when returning to the screen
      setSuccess(null);
      setError(null);
    }, [])
  );

  async function onSubmit() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password);
      setSuccess('Account created. You can now log in.');
      // optionally navigate to login
      setTimeout(() => router.push('/login'), 1200);
    } catch (e: any) {
      // Accept either error text or JSON from backend
      setError(e.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView testID="register-screen" style={styles.container}>
      <ThemedText style={styles.title}>Register</ThemedText>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      {success ? (
        <ThemedText style={styles.success}>{success}</ThemedText>
      ) : null}
      <TextInput
        testID="register-email-input"
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, themedInput(theme)]}
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
        style={[styles.input, themedInput(theme)]}
      />
      <Button
        title={loading ? 'Creating...' : 'Create account'}
        onPress={onSubmit}
        disabled={loading}
      />
      <View style={styles.row}>
        <ThemedText>Already have an account? </ThemedText>
        <Link href="/login">
          <ThemedText type="linkPrimary">Login</ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}
