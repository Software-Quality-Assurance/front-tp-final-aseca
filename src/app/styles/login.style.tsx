import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AuthInput } from '@/app/styles/auth-input.style';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  title: { fontSize: 24, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    marginTop: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  error: { color: 'red', marginBottom: 8 },
});

type ScreenProps = {
  children: React.ReactNode;
  testID?: string;
};

export function LoginScreen({ children, testID }: ScreenProps) {
  return (
    <ThemedView
      testID={testID}
      accessibilityLabel={testID}
      style={styles.container}
    >
      {children}
    </ThemedView>
  );
}

export function LoginTitle({ children }: { children: string }) {
  return <ThemedText style={styles.title}>{children}</ThemedText>;
}

export function LoginError({ children }: { children: string }) {
  return <ThemedText style={styles.error}>{children}</ThemedText>;
}

export { AuthInput as LoginInput };

export function LoginFooterRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}
