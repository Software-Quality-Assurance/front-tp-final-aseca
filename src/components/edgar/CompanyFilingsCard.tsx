import React from 'react';
import { View, Linking, TouchableOpacity } from 'react-native';
import { FilingsResponse } from '@/actions/edgar';
import { ThemedText } from '../themed-text';

type Props = {
  data: FilingsResponse;
};

export function CompanyFilingsCard({ data }: Props) {
  if (data.filings.length === 0) {
    return (
      <View className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-4" testID="company-filings-empty">
         <ThemedText className="font-bold text-lg mb-2">Recent Filings</ThemedText>
         <ThemedText themeColor="textSecondary" className="text-sm">
           {data.message || 'No recent 10-K or 10-Q filings found.'}
         </ThemedText>
      </View>
    );
  }

  return (
    <View className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 mb-4" testID="company-filings-card">
      <ThemedText className="font-bold text-lg mb-3 border-b border-gray-200 dark:border-gray-800 pb-2">
        Recent Filings
      </ThemedText>
      
      <View className="gap-2">
        {data.filings.map((filing) => (
          <TouchableOpacity 
            key={filing.accessionNumber}
            onPress={() => Linking.openURL(filing.documentUrl)}
            className="flex-row justify-between items-center p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
            testID={`filing-${filing.form}`}
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                <ThemedText className="text-blue-700 dark:text-blue-400 font-bold text-xs">
                  {filing.form}
                </ThemedText>
              </View>
              <ThemedText className="text-sm font-medium">
                {filing.filingDate}
              </ThemedText>
            </View>
            <ThemedText className="text-xs text-blue-500 underline">
              View PDF
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
