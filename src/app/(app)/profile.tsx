import React, { useEffect, useState } from 'react';
import { Alert, Button, Platform } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'expo-router';
import {
  ProfileScreen,
  ProfileTitle,
  ProfileUserId,
  ProfileMessage,
  ProfileInput,
  ProfileSpacer,
} from '@/app/styles/profile.style';

export default function ProfilePage() {
  const { user, loading, updateProfile, deleteAccount, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

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

  if (loading) return <ProfileMessage>Loading...</ProfileMessage>;
  if (!user)
    return <ProfileMessage>Not authenticated. Please log in.</ProfileMessage>;

  return (
    <ProfileScreen testID="profile-screen">
      <ProfileTitle>Profile</ProfileTitle>
      <ProfileUserId>ID: {user.id}</ProfileUserId>
      <ProfileInput
        testID="profile-email-input"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType={Platform.OS === 'web' ? 'default' : 'email-address'}
        autoCapitalize="none"
        editable={!loading && !saving}
      />
      <ProfileInput
        testID="profile-password-input"
        placeholder="New password (leave blank to keep)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!loading && !saving}
      />
      <Button
        title={saving ? 'Saving...' : 'Save changes'}
        onPress={doSave}
        disabled={saving}
      />
      <ProfileSpacer />
      <Button
        title="Logout"
        onPress={async () => {
          await logout();
          router.push('/login');
        }}
      />
      <ProfileSpacer />
      <Button title="Delete account" color="red" onPress={doDelete} />
    </ProfileScreen>
  );
}
