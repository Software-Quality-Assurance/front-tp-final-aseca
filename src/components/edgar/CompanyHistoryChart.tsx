import React from 'react';
import { View, ScrollView } from 'react-native';
import { FinancialHistoryResponse } from '@/actions/edgar';
import { ThemedText } from '../themed-text';
import { PartialDataBadge } from './PartialDataBadge';

type Props = {
  history: FinancialHistoryResponse;
};

export function CompanyHistoryChart({ history }: Props) {
  if (history.points.length === 0) {
    return (
      <View className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-4">
        <ThemedText className="text-sm" themeColor="textSecondary">
          No historical data available.
        </ThemedText>
      </View>
    );
  }

  // Find max value to normalize simple bar chart
  const maxValue = Math.max(...history.points.map((p) => Math.abs(p.value)), 1);

  return (
    <View
      className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-4"
      testID="company-history-card"
    >
      <View className="flex-row justify-between items-center mb-3">
        <ThemedText className="font-bold text-lg">
          History ({history.metric})
        </ThemedText>
        <PartialDataBadge partial={history.partial} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row gap-4 items-end pt-4 pb-2">
          {history.points.map((point, index) => {
            const heightPercent = Math.max(
              10,
              Math.min(100, (Math.abs(point.value) / maxValue) * 100)
            );
            const isNegative = point.value < 0;

            return (
              <View
                key={`${point.period}-${index}`}
                className="items-center"
                testID={`history-point-${point.period}`}
              >
                <ThemedText className="text-[10px] mb-1 text-gray-500">
                  {formatCompact(point.value)}
                </ThemedText>

                <View
                  className={`w-8 rounded-t-sm ${isNegative ? 'bg-red-400 dark:bg-red-500' : 'bg-green-400 dark:bg-green-500'}`}
                  style={{ height: `${heightPercent}%`, minHeight: 4 }}
                />

                <ThemedText className="text-[10px] mt-1 font-medium transform -rotate-45 translate-y-2">
                  {point.period}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function formatCompact(val: number) {
  if (Math.abs(val) >= 1_000_000_000) {
    return `${(val / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(val) >= 1_000_000) {
    return `${(val / 1_000_000).toFixed(1)}M`;
  }
  return val.toFixed(1);
}
