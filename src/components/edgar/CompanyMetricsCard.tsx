import React from 'react';
import { View } from 'react-native';
import { FinancialMetricsResponse, FinancialMetricValue } from '@/actions/edgar';
import { ThemedText } from '../themed-text';
import { PartialDataBadge } from './PartialDataBadge';

type Props = {
  metrics: FinancialMetricsResponse;
};

export function CompanyMetricsCard({ metrics }: Props) {
  return (
    <View
      className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-4"
      testID="company-metrics-card"
      accessibilityLabel="company-metrics-card"
    >
      <View className="flex-row justify-between items-center mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
        <ThemedText className="font-bold text-lg">Financial Metrics</ThemedText>
        <PartialDataBadge partial={metrics.partial} />
      </View>
      
      <View className="gap-3">
        <MetricRow label="Revenue" data={metrics.revenue} isMoney />
        <MetricRow label="Net Income" data={metrics.netIncome} isMoney />
        <MetricRow label="EPS" data={metrics.eps} isMoney />
        <MetricRow label="Total Assets" data={metrics.totalAssets} isMoney />
        <MetricRow label="Total Liabilities" data={metrics.totalLiabilities} isMoney />
      </View>
    </View>
  );
}

function MetricRow({ label, data, isMoney }: { label: string; data: FinancialMetricValue; isMoney?: boolean }) {
  const hasValue = data.value !== null && data.value !== undefined;
  
  let formattedValue = 'N/A';
  if (hasValue) {
    // format large numbers
    if (Math.abs(data.value!) >= 1_000_000_000) {
      formattedValue = `${(data.value! / 1_000_000_000).toFixed(2)}B`;
    } else if (Math.abs(data.value!) >= 1_000_000) {
      formattedValue = `${(data.value! / 1_000_000).toFixed(2)}M`;
    } else {
      formattedValue = data.value!.toFixed(2);
    }
    if (isMoney) formattedValue = `$${formattedValue}`;
  }

  return (
    <View
      className="flex-row justify-between items-center"
      testID={`metric-row-${label.replace(/\s+/g, '-').toLowerCase()}`}
      accessibilityLabel={`metric-row-${label.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <ThemedText className="font-medium text-sm text-gray-700 dark:text-gray-300">{label}</ThemedText>
      <View className="items-end">
        <ThemedText className={`font-semibold text-sm ${!hasValue ? 'text-gray-400' : ''}`}>
          {formattedValue}
        </ThemedText>
        {data.reportDate && (
          <ThemedText className="text-[10px] text-gray-500">
            {data.reportDate} ({data.form})
          </ThemedText>
        )}
      </View>
    </View>
  );
}
