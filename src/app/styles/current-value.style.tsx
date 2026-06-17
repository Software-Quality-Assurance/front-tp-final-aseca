import React from 'react';
import { SafeAreaView, StyleSheet, View, ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const currentValueHeaderBorderClassName =
  'border-b border-gray-200 dark:border-gray-800';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

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

  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  centeredContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export function CurrentValueScreen({
  children,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <ThemedView style={styles.container} {...props}>
      {children}
    </ThemedView>
  );
}

export function CurrentValueSafeArea({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>;
}

export function CurrentValueHeader({
  children,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View
      style={styles.screenHeader}
      className={currentValueHeaderBorderClassName}
      {...props}
    >
      {children}
    </View>
  );
}

export function CurrentValueTitle({ children }: { children: string }) {
  return <ThemedText style={styles.screenTitle}>{children}</ThemedText>;
}

export function CurrentValueContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.content}>{children}</View>;
}

export function CurrentValueCenteredContent({
  children,
  ...props
}: ViewProps & {
  children: React.ReactNode;
}) {
  return (
    <View style={styles.centeredContent} {...props}>
      {children}
    </View>
  );
}
