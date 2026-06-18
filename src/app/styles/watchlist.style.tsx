import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const watchlistHeaderBorderClassName =
  'border-b border-gray-200 dark:border-gray-800';

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
});

type ScreenProps = {
  children: React.ReactNode;
  testID?: string;
};

export function WatchlistScreen({ children, testID }: ScreenProps) {
  return (
    <ThemedView
      style={styles.container}
      testID={testID}
      accessibilityLabel={testID}
    >
      {children}
    </ThemedView>
  );
}

export function WatchlistSafeArea({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>;
}

export function WatchlistHeader({
  children,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View
      style={styles.screenHeader}
      className={watchlistHeaderBorderClassName}
      {...props}
    >
      {children}
    </View>
  );
}

export function WatchlistTitle({ children }: { children: string }) {
  return <ThemedText style={styles.screenTitle}>{children}</ThemedText>;
}
