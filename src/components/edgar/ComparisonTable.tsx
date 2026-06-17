import React from 'react';
import { View, ScrollView } from 'react-native';
import { CompanyComparisonResponse, FinancialMetric } from '@/actions/edgar';
import { ThemedText } from '../themed-text';

type Props = {
  companies: CompanyComparisonResponse[];
};

export function ComparisonTable({ companies }: Props) {
  const metrics: { key: FinancialMetric; label: string; isMoney: boolean }[] = [
    { key: 'REVENUE', label: 'Revenue', isMoney: true },
    { key: 'NET_INCOME', label: 'Net Income', isMoney: true },
    { key: 'EPS', label: 'EPS', isMoney: true },
    { key: 'TOTAL_ASSETS', label: 'Total Assets', isMoney: true },
    { key: 'TOTAL_LIABILITIES', label: 'Total Liabilities', isMoney: true },
  ];

  return (
    <View className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-2 mb-4" testID="comparison-table">
      <ScrollView horizontal bounces={false} showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
        <View>
          {/* Header Row */}
          <View className="flex-row border-b border-gray-200 dark:border-gray-800 pb-2 mb-2">
            <View className="w-32 justify-center pl-2">
              <ThemedText className="font-bold text-sm">Metric</ThemedText>
            </View>
            {companies.map((c) => (
              <View key={c.ticker} className="w-32 items-center justify-center">
                <ThemedText className="font-bold text-sm text-center">{c.ticker}</ThemedText>
                <View className="flex-row gap-1 mt-1">
                  {c.inPortfolio && <View className="bg-purple-100 dark:bg-purple-900 px-1 rounded"><ThemedText className="text-[10px] text-purple-700 dark:text-purple-300">PF</ThemedText></View>}
                  {c.inWatchlist && <View className="bg-blue-100 dark:bg-blue-900 px-1 rounded"><ThemedText className="text-[10px] text-blue-700 dark:text-blue-300">WL</ThemedText></View>}
                </View>
              </View>
            ))}
          </View>

          {/* Metric Rows */}
          {metrics.map((metric, index) => (
            <View key={metric.key} className={`flex-row py-3 ${index < metrics.length - 1 ? 'border-b border-gray-100 dark:border-gray-800' : ''}`}>
              <View className="w-32 justify-center pl-2">
                <ThemedText className="font-medium text-xs text-gray-700 dark:text-gray-300">{metric.label}</ThemedText>
              </View>
              
              {companies.map((c) => {
                const metricKey = metric.key === 'REVENUE' ? 'revenue' 
                  : metric.key === 'NET_INCOME' ? 'netIncome'
                  : metric.key === 'EPS' ? 'eps'
                  : metric.key === 'TOTAL_ASSETS' ? 'totalAssets'
                  : 'totalLiabilities';
                
                const data = c.metrics[metricKey];
                const hasValue = data && data.value !== null && data.value !== undefined;
                const isBest = c.bestMetrics.includes(metric.key);
                
                let formattedValue = 'N/A';
                if (hasValue) {
                  if (Math.abs(data.value!) >= 1_000_000_000) {
                    formattedValue = `${(data.value! / 1_000_000_000).toFixed(2)}B`;
                  } else if (Math.abs(data.value!) >= 1_000_000) {
                    formattedValue = `${(data.value! / 1_000_000).toFixed(2)}M`;
                  } else {
                    formattedValue = data.value!.toFixed(2);
                  }
                  if (metric.isMoney) formattedValue = `$${formattedValue}`;
                }

                return (
                  <View key={`${c.ticker}-${metric.key}`} className={`w-32 items-center justify-center p-1 rounded-lg ${isBest ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50' : ''}`} testID={`compare-${c.ticker}-${metricKey}`}>
                    <ThemedText className={`text-xs ${isBest ? 'font-bold text-green-700 dark:text-green-400' : hasValue ? 'font-medium' : 'text-gray-400'}`}>
                      {formattedValue}
                    </ThemedText>
                    {isBest && <ThemedText className="text-[8px] text-green-600 dark:text-green-500 mt-0.5" testID="best-value-badge">Best</ThemedText>}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
