import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { HistoryFilterType } from '@/types/history.types';
import { styles } from '@/app/styles/history/HistoryFilterBarStyles';

const TYPE_OPTIONS: { label: string; value: HistoryFilterType }[] = [
  { label: 'Todas', value: 'ALL' },
  { label: 'Compras', value: 'BUY' },
  { label: 'Ventas', value: 'SELL' },
];

interface Props {
  filterType: HistoryFilterType;
  onTypeChange: (type: HistoryFilterType) => void;
}

export function HistoryFilterBar({ filterType, onTypeChange }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
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
    </View>
  );
}
