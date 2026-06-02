import React, { useEffect, useState } from 'react';
import { Alert, Button, TextInput, View, Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { styles, themedInput } from '@/styles/profile.styles';

export default function ProfilePage() {
  const { user, loading, updateProfile, deleteAccount, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    setEmail(user?.email ?? '');
  }, [user]);

  async function doSave() {
    setSaving(true);
    try {
      await updateProfile({
        email: email.trim().toLowerCase() || undefined,
        password: password || undefined,
      });
      if (Platform.OS === 'web') {
        window.alert('Your profile was updated.');
      } else {
        Alert.alert('Saved', 'Your profile was updated.');
      }
      setPassword('');
    } catch (e: any) {
      if (Platform.OS === 'web') {
        window.alert('Error: ' + (e.message ?? 'Update failed'));
      } else {
        Alert.alert('Error', e.message ?? 'Update failed');
      }
    } finally {
      setSaving(false);
    }
  }

  async function doDelete() {
    const performDelete = async () => {
      try {
        await deleteAccount();
        if (Platform.OS === 'web') {
          window.alert('Your account was deleted.');
        } else {
          Alert.alert('Deleted', 'Your account was deleted.');
        }
        router.push('/');
      } catch (e: any) {
        if (Platform.OS === 'web') {
          window.alert('Error: ' + (e.message ?? 'Delete failed'));
        } else {
          Alert.alert('Error', e.message ?? 'Delete failed');
        }
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        'Are you sure you want to delete your account?'
      );
      if (confirmed) {
        await performDelete();
      }
    } else {
      Alert.alert('Confirm', 'Are you sure you want to delete your account?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDelete,
        },
      ]);
    }
  }

  if (loading)
    return <ThemedText style={styles.message}>Loading...</ThemedText>;
  if (!user)
    return (
      <ThemedText style={styles.message}>
        Not authenticated. Please log in.
      </ThemedText>
    );

  return (
    <ThemedView testID="profile-screen" style={styles.container}>
      <ThemedText style={styles.title}>Profile</ThemedText>
      <ThemedText>ID: {user.id}</ThemedText>
      <TextInput
        testID="profile-email-input"
        placeholder="Email"
        placeholderTextColor={theme.textSecondary}
        value={email}
        onChangeText={setEmail}
        style={[styles.input, themedInput(theme)]}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        testID="profile-password-input"
        placeholder="New password (leave blank to keep)"
        placeholderTextColor={theme.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[styles.input, themedInput(theme)]}
      />
      <Button
        title={saving ? 'Saving...' : 'Save changes'}
        onPress={doSave}
        disabled={saving}
      />
      <View style={styles.spacer} />
      <Button
        title="Logout"
        onPress={async () => {
          await logout();
          router.push('/login');
        }}
      />
      <View style={styles.spacer} />
      <Button title="Delete account" color="red" onPress={doDelete} />
    </ThemedView>
  );
}
