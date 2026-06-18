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
  success: { color: 'green', marginBottom: 8 },
});

type ScreenProps = {
  children: React.ReactNode;
  testID?: string;
};

export function RegisterScreen({ children, testID }: ScreenProps) {
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

export function RegisterTitle({ children }: { children: string }) {
  return <ThemedText style={styles.title}>{children}</ThemedText>;
}

type MessageProps = {
  children: string;
  testID?: string;
};

export function RegisterError({ children, testID }: MessageProps) {
  return (
    <ThemedText
      style={styles.error}
      testID={testID}
      accessibilityLabel={testID}
    >
      {children}
    </ThemedText>
  );
}

export function RegisterSuccess({ children, testID }: MessageProps) {
  return (
    <ThemedText
      style={styles.success}
      testID={testID}
      accessibilityLabel={testID}
    >
      {children}
    </ThemedText>
  );
}

export { AuthInput as RegisterInput };

export function RegisterFooterRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}
