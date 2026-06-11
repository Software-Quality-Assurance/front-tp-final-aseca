import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    gap: 8,
  },

  label: {
    fontSize: 14,
  },

  value: {
    fontSize: 32,
    fontWeight: '700',
  },

  profit: {
    fontSize: 16,
    fontWeight: '600',
  },
});

type Props = {
  totalValue: number;
  totalPnL: number;
};

export function CurrentValueSummary({ totalValue, totalPnL }: Props) {
  return (
    <View style={styles.container}>
      <ThemedText themeColor="textSecondary">Portfolio Value</ThemedText>

      <ThemedText style={styles.value}>${totalValue.toFixed(2)}</ThemedText>

      <ThemedText
        style={[
          styles.profit,
          {
            color: totalPnL >= 0 ? '#16a34a' : '#dc2626',
          },
        ]}
      >
        {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
      </ThemedText>
    </View>
  );
}
