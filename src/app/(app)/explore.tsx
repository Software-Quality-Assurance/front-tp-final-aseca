import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useEdgarSearch } from '@/hooks/use-edgar-search';
import { useEdgarCompany } from '@/hooks/use-edgar-company';
import { FinancialMetric } from '@/actions/edgar';
import { CompanySearchBar } from '@/components/edgar/CompanySearchBar';
import { CompanySearchResults } from '@/components/edgar/CompanySearchResults';
import { CompanyMetricsCard } from '@/components/edgar/CompanyMetricsCard';
import { CompanyFilingsCard } from '@/components/edgar/CompanyFilingsCard';
import { CompanyHistoryChart } from '@/components/edgar/CompanyHistoryChart';
import { Ionicons } from '@expo/vector-icons';
import {
  ExploreContainer,
  ExploreLinkButton,
  ExploreLinkPressable,
  ExploreScroll,
  ExploreTitleSection,
} from '@/app/styles/explore.style';

export default function ExploreScreen() {
  const theme = useTheme();
  
  const searchHook = useEdgarSearch();
  const companyHook = useEdgarCompany();
  
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<FinancialMetric>('REVENUE');

  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = (query: string) => {
    setLastQuery(query);
    setSelectedTicker(null);
    companyHook.clear();
    searchHook.search(query);
  };

  const handleSelectCompany = (ticker: string) => {
    setSelectedTicker(ticker);
    companyHook.fetchMetrics(ticker);
    companyHook.fetchFilings(ticker);
    companyHook.fetchHistory(ticker, selectedMetric);
  };

  const handleMetricChange = (metric: FinancialMetric) => {
    setSelectedMetric(metric);
    if (selectedTicker) {
      companyHook.fetchHistory(selectedTicker, metric);
    }
  };

  const handleBack = () => {
    setSelectedTicker(null);
    companyHook.clear();
  };

  const renderContent = () => {
    if (selectedTicker) {
      const isLoading = companyHook.loadingMetrics || companyHook.loadingFilings;
      
      return (
        <View className="flex-1">
          <View className="mb-4 self-start">
            <ExploreLinkPressable onPress={handleBack}>
              <ExploreLinkButton>
                <View className="flex-row items-center" testID="explore-back-button">
                  <Ionicons name="arrow-back" size={20} color={theme.text} />
                  <ThemedText className="ml-1 font-medium" themeColor="text">Back to search</ThemedText>
                </View>
              </ExploreLinkButton>
            </ExploreLinkPressable>
          </View>
          
          <ThemedText className="text-2xl font-bold mb-4">{selectedTicker} Analysis</ThemedText>
          
          {companyHook.error ? (
            <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl mb-4">
              <ThemedText className="text-red-600 dark:text-red-400">{companyHook.error}</ThemedText>
            </View>
          ) : null}

          {isLoading ? (
            <ActivityIndicator size="large" className="my-8" />
          ) : (
             <View>
              {companyHook.metrics && <CompanyMetricsCard metrics={companyHook.metrics} />}
              
              <View className="flex-row flex-wrap gap-2 mb-2" testID="metric-selectors">
                {(['REVENUE', 'NET_INCOME', 'EPS', 'TOTAL_ASSETS', 'TOTAL_LIABILITIES'] as FinancialMetric[]).map(m => (
                  <TouchableOpacity
                    key={m}
                    testID={`select-metric-${m}`}
                    onPress={() => handleMetricChange(m)}
                    className={`px-3 py-1.5 rounded-full border ${
                      selectedMetric === m 
                        ? 'bg-blue-500 border-blue-500' 
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <ThemedText className={`text-xs font-semibold ${selectedMetric === m ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                      {m.replace('_', ' ')}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
              
              {companyHook.loadingHistory ? (
                <ActivityIndicator size="small" className="my-4" />
              ) : (
                companyHook.history[selectedMetric] && 
                  <CompanyHistoryChart history={companyHook.history[selectedMetric]} />
              )}
              
              {companyHook.filings && <CompanyFilingsCard data={companyHook.filings} />}
            </View>
          )}
        </View>
      );
    }

    return (
        <View className="flex-1">
          <ExploreTitleSection>
            <ThemedText type="subtitle">Company Explorer</ThemedText>
            <ThemedText className="mb-4" themeColor="textSecondary">
              Search for an SEC EDGAR registered company to analyze its financial health.
            </ThemedText>
          </ExploreTitleSection>
          
          <CompanySearchBar initialQuery={lastQuery} onSearch={handleSearch} loading={searchHook.loading} />
          
          {searchHook.error ? (
            <ThemedText testID="search-error" className="text-red-500 mt-2">{searchHook.error}</ThemedText>
          ) : null}
          
          <CompanySearchResults 
            results={searchHook.results} 
            loading={searchHook.loading}
            onSelect={handleSelectCompany} 
          />
          
          {!searchHook.loading && !searchHook.error && searchHook.results.length === 0 && (
            <View testID="search-empty-state" className="items-center justify-center py-10 opacity-50">
              <Ionicons name="search" size={48} color={theme.textSecondary} />
              <ThemedText className="mt-4" themeColor="textSecondary">Search by ticker or name</ThemedText>
            </View>
          )}
        </View>
    );
  };

  return (
    <ExploreScroll testID="explore-screen">
      <ExploreContainer>
        {renderContent()}
      </ExploreContainer>
    </ExploreScroll>
  );
}
