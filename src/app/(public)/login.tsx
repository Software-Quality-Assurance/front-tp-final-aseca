import React, { useEffect, useState } from 'react';
import { Link, useRouter } from 'expo-router';
import { Button } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import {
  LoginScreen,
  LoginTitle,
  LoginError,
  LoginInput,
  LoginFooterRow,
} from '@/app/styles/LoginStyles';

export default function LoginPage() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <LoginScreen testID="login-screen">
      <LoginTitle>Login</LoginTitle>
      {error ? <LoginError>{error}</LoginError> : null}
      <LoginInput
        testID="login-email-input"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <LoginInput
        testID="login-password-input"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={onSubmit}
        disabled={loading}
      />
      <LoginFooterRow>
        <ThemedText>{"Don't have an account? "}</ThemedText>
        <Link href="/register">
          <ThemedText type="linkPrimary">Register</ThemedText>
        </Link>
      </LoginFooterRow>
    </LoginScreen>
  );
}
