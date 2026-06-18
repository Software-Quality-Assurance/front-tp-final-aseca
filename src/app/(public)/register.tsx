import React, { useState, useCallback } from 'react';
import { Link, useRouter, useFocusEffect } from 'expo-router';
import { Button, Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/themed-text';
import {
  RegisterScreen,
  RegisterTitle,
  RegisterError,
  RegisterSuccess,
  RegisterInput,
  RegisterFooterRow,
} from '@/app/styles/register.style';

export default function RegisterPage() {
  const { register, loading: authLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
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
      setTimeout(() => router.push('/login'), 1200);
    } catch (e: any) {
      setError(e.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <RegisterScreen testID="register-screen">
      <RegisterTitle>Register</RegisterTitle>
      {error ? (
        <RegisterError testID="register-error-message">{error}</RegisterError>
      ) : null}
      {success ? (
        <RegisterSuccess testID="register-success-message">
          {success}
        </RegisterSuccess>
      ) : null}
      <RegisterInput
        testID="register-email-input"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType={Platform.OS === 'web' ? 'default' : 'email-address'}
        autoCapitalize="none"
        editable={!authLoading && !loading}
      />
      <RegisterInput
        testID="register-password-input"
        placeholder="Password (min 8 chars)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!authLoading && !loading}
      />
      <Button
        title={loading ? 'Creating...' : 'Create account'}
        onPress={onSubmit}
        disabled={loading}
        accessibilityLabel="register-submit-button"
      />
      <RegisterFooterRow>
        <ThemedText>Already have an account? </ThemedText>
        <Link
          href="/login"
          testID="go-to-login-link"
          accessibilityLabel="go-to-login-link"
        >
          <ThemedText type="linkPrimary">Login</ThemedText>
        </Link>
      </RegisterFooterRow>
    </RegisterScreen>
  );
}
