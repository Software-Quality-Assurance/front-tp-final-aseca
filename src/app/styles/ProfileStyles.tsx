import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AuthInput } from '@/app/styles/AuthInput';

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'flex-start' },
  title: { fontSize: 24, marginBottom: 12 },
  userId: { marginBottom: 8 },
  message: { padding: 16 },
  spacer: { height: 8 },
});

type ScreenProps = {
  children: React.ReactNode;
  testID?: string;
};

export function ProfileScreen({ children, testID }: ScreenProps) {
  return (
    <ThemedView testID={testID} style={styles.container}>
      {children}
    </ThemedView>
  );
}

export function ProfileTitle({ children }: { children: string }) {
  return <ThemedText style={styles.title}>{children}</ThemedText>;
}

export function ProfileUserId({ children }: { children: React.ReactNode }) {
  return <ThemedText style={styles.userId}>{children}</ThemedText>;
}

export function ProfileMessage({ children }: { children: React.ReactNode }) {
  return <ThemedText style={styles.message}>{children}</ThemedText>;
}

export { AuthInput as ProfileInput };

export function ProfileSpacer() {
  return <View style={styles.spacer} />;
}
