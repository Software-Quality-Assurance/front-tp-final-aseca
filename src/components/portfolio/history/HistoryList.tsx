import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import type { Operation } from '@/actions/types';
import { HistoryTransactionCard } from '@/components/portfolio/history/HistoryTransactionCard';
import { styles } from '@/app/styles/history/HistoryListStyles';

interface Props {
  operations: Operation[];
  isLoading: boolean;
  error: string | null;
  onEdit: (operation: Operation) => void;
  onRefresh: () => void;
}

export function HistoryList({
  operations,
  isLoading,
  error,
  onEdit,
  onRefresh,
}: Props) {
  const theme = useTheme();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.text} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.errorIcon}>⚠</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.messageText}>
          {error}
        </ThemedText>
      </View>
    );
  }

  if (operations.length === 0) {
    return (
      <View testID="history-empty-state" style={styles.centered}>
        <ThemedText style={styles.emptyIcon}>📋</ThemedText>
        <ThemedText className="text-lg font-semibold">
          No transactions yet
        </ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.messageText}>
          No transactions match the selected filters.
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      testID="history-list"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={onRefresh}
          tintColor={theme.text}
        />
      }
    >
      {operations.map((op) => (
        <HistoryTransactionCard
          key={op.id}
          operation={op}
          onEdit={onEdit}
          onRefresh={onRefresh}
        />
      ))}
    </ScrollView>
  );
}
