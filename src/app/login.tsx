import React, { useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Button, TextInput, View } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { styles, themedInput } from '@/styles/login.styles';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/profile');
    }
  }, [authLoading, user, router]);

  async function onSubmit() {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      router.replace('/profile');
    } catch (e: any) {
      setError(e.message ?? 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView testID="login-screen" style={styles.container}>
      <ThemedText style={styles.title}>Login</ThemedText>
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
      <TextInput
        testID="login-email-input"
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, themedInput(theme)]}
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
        style={[styles.input, themedInput(theme)]}
      />
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={onSubmit}
        disabled={loading}
      />
      <View style={styles.row}>
        <ThemedText>{"Don't have an account? "}</ThemedText>
        <Link href="/register">
          <ThemedText type="linkPrimary">Register</ThemedText>
        </Link>
      </View>
    </ThemedView>
  );
}
