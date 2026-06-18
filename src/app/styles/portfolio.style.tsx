import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export const portfolioHeaderBorderClassName =
  'border-b border-gray-200 dark:border-gray-800';

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  linkSection: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 4,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  linkText: {
    color: '#3b82f6',
    fontWeight: '500',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
});

export function PortfolioScreen({ children }: { children: React.ReactNode }) {
  return (
    <ThemedView
      style={styles.container}
      testID="portfolio-screen"
      accessibilityLabel="portfolio-screen"
    >
      {children}
    </ThemedView>
  );
}

export function PortfolioSafeArea({ children }: { children: React.ReactNode }) {
  return <SafeAreaView style={styles.safeArea}>{children}</SafeAreaView>;
}

export function PortfolioHeader({
  children,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View
      style={styles.screenHeader}
      className={portfolioHeaderBorderClassName}
      {...props}
    >
      {children}
    </View>
  );
}

export function PortfolioTitle({ children }: { children: string }) {
  return <ThemedText style={styles.screenTitle}>{children}</ThemedText>;
}

export function PortfolioLinkSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.linkSection}>{children}</View>;
}

type LinkButtonProps = {
  children: React.ReactNode;
  onPress: () => void;
};

export function PortfolioLinkButton({ children, onPress }: LinkButtonProps) {
  return (
    <TouchableOpacity
      style={styles.linkRow}
      onPress={onPress}
      testID="portfolio-current-value-link"
      accessibilityLabel="portfolio-current-value-link"
    >
      <Text style={styles.linkText}>{children}</Text>
    </TouchableOpacity>
  );
}

export function PortfolioContent({ children }: { children: React.ReactNode }) {
  return <View style={styles.content}>{children}</View>;
}
