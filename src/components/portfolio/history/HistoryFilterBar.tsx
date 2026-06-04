import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { HistoryFilterStatus, HistoryFilterType } from '@/types/history.types';

const TYPE_OPTIONS: { label: string; value: HistoryFilterType }[] = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Compras', value: 'BUY' },
  { label: 'Ventas', value: 'SELL' },
];

const STATUS_OPTIONS: { label: string; value: HistoryFilterStatus }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Completadas', value: 'COMPLETED' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Rechazadas', value: 'REJECTED' },
];

interface Props {
  filterType: HistoryFilterType;
  filterStatus: HistoryFilterStatus;
  onTypeChange: (type: HistoryFilterType) => void;
  onStatusChange: (status: HistoryFilterStatus) => void;
}

export function HistoryFilterBar({
  filterType,
  filterStatus,
  onTypeChange,
  onStatusChange,
}: Props) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      {/* Tabs de tipo */}
      <View
        style={[styles.tabRow, { borderBottomColor: theme.backgroundSelected }]}
      >
        {TYPE_OPTIONS.map((opt) => {
          const isActive = filterType === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onTypeChange(opt.value)}
              style={[
                styles.tab,
                isActive && {
                  borderBottomColor: theme.text,
                  borderBottomWidth: 2,
                },
              ]}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.text : theme.textSecondary },
                ]}
              >
                {opt.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Chips de estado */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRow}
      >
        {STATUS_OPTIONS.map((opt) => {
          const isActive = filterStatus === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => onStatusChange(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive
                    ? theme.text
                    : theme.backgroundElement,
                  borderColor: theme.backgroundSelected,
                },
              ]}
              activeOpacity={0.7}
            >
              <ThemedText
                style={[
                  styles.chipLabel,
                  { color: isActive ? theme.background : theme.textSecondary },
                ]}
              >
                {opt.label}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
    paddingBottom: 8,
  },
  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 24,
  },
  tab: {
    paddingVertical: 10,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  chipRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
});
