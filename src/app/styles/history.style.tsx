import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const historyHeaderBorderClassName =
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
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function HistoryScreen({ children }: { children: React.ReactNode }) {
  return <ThemedView style={styles.container}>{children}</ThemedView>;
}

export function HistorySafeArea({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>;
}

export function HistoryHeader({
  children,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View
      style={styles.screenHeader}
      className={historyHeaderBorderClassName}
      {...props}
    >
      {children}
    </View>
  );
}

export function HistoryTitle({ children }: { children: string }) {
  return <ThemedText style={styles.screenTitle}>{children}</ThemedText>;
}

export function HistoryCenteredContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.centeredContent}>{children}</View>;
}
