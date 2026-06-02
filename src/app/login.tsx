import React, { useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Button, TextInput, View, StyleSheet } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { SharedStyles } from '@/app/styles/SharedStyles';

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
    <ThemedView testID="login-screen" style={SharedStyles.authScreen}>
      <ThemedText className="text-2xl mb-3">Login</ThemedText>
      {error ? (
        <ThemedText className="text-red-500 mb-2">{error}</ThemedText>
      ) : null}
      <TextInput
        testID="login-email-input"
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            color: theme.text,
            borderColor: theme.backgroundSelected,
          },
        ]}
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
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundElement,
            color: theme.text,
            borderColor: theme.backgroundSelected,
          },
        ]}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  title: { fontSize: 24, marginBottom: 12 },
  input: {
    width: '100%',
    minHeight: 44,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 8,
    borderRadius: 6,
  },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  error: { color: 'red', marginBottom: 8 },
});
