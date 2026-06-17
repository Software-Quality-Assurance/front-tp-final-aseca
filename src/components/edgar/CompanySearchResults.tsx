import React from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { EdgarCompanyResponse } from '@/actions/edgar';
import { ThemedText } from '../themed-text';

type Props = {
  results: EdgarCompanyResponse[];
  onSelect: (ticker: string) => void;
  loading?: boolean;
};

export function CompanySearchResults({ results, onSelect, loading }: Props) {
  if (loading) {
    return <ActivityIndicator size="small" className="m-4" />;
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <View className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden mb-4" testID="company-search-results">
      {results.map((company, index) => (
        <TouchableOpacity
          key={company.cik}
          testID={`search-result-${company.ticker}`}
          onPress={() => onSelect(company.ticker)}
          className={`p-4 flex-row items-center justify-between ${
            index > 0 ? 'border-t border-gray-200 dark:border-gray-800' : ''
          }`}
        >
          <View>
            <ThemedText className="font-bold text-base">{company.ticker}</ThemedText>
            <ThemedText className="text-sm" themeColor="textSecondary">
              {company.name}
            </ThemedText>
          </View>
          <ThemedText className="text-xs" themeColor="textSecondary">
            CIK: {company.cik}
          </ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}
