import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { GroupedOperations } from '@/hooks/use-history';
import { HistoryTransactionCard } from '@/components/portfolio/history/HistoryTransactionCard';

interface Props {
  grouped: GroupedOperations[];
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function HistoryList({ grouped, isLoading, error, onRefresh }: Props) {
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

  if (grouped.length === 0) {
    return (
      <View style={styles.centered}>
        <ThemedText style={styles.emptyIcon}>📋</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.messageText}>
          No hay transacciones que coincidan con los filtros seleccionados.
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
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
      {grouped.map((group) => (
        <View key={group.status} style={styles.group}>
          <View style={styles.sectionHeader}>
            <ThemedText
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              {group.label}
            </ThemedText>
            <View
              style={[
                styles.sectionCount,
                { backgroundColor: theme.backgroundElement },
              ]}
            >
              <ThemedText
                style={[
                  styles.sectionCountText,
                  { color: theme.textSecondary },
                ]}
              >
                {group.data.length}
              </ThemedText>
            </View>
          </View>

          {group.data.map((op) => (
            <HistoryTransactionCard key={op.id} operation={op} />
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 40,
    gap: 24,
  },
  group: {
    gap: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingBottom: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sectionCount: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  sectionCountText: {
    fontSize: 11,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIcon: {
    fontSize: 40,
  },
  errorIcon: {
    fontSize: 36,
  },
  messageText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
