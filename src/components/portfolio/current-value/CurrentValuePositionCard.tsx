import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { ThemedText } from '@/components/themed-text';

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  ticker: {
    fontSize: 16,
    fontWeight: '700',
  },

  value: {
    fontWeight: '600',
  },

  pnl: {
    marginTop: 6,
    fontWeight: '600',
  },
});

type Props = ViewProps & {
  ticker: string;
  currentValue: number;
  profitLoss: number;
};

export function CurrentValuePositionCard({
  ticker,
  currentValue,
  profitLoss,
  ...props,
}: Props) {
  return (
    <View
      testID={`current-value-position-${ticker}`}
      style={styles.card}
      {...props}
    >
      <View style={styles.row}>
        <ThemedText style={styles.ticker}>{ticker}</ThemedText>

        <ThemedText style={styles.value}>${currentValue.toFixed(2)}</ThemedText>
      </View>

      <ThemedText
        style={[
          styles.pnl,
          {
            color: profitLoss >= 0 ? '#16a34a' : '#dc2626',
          },
        ]}
      >
        {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
      </ThemedText>
    </View>
  );
}
