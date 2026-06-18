import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  initialQuery?: string;
  onSearch: (query: string) => void;
  loading: boolean;
};

export function CompanySearchBar({
  initialQuery = '',
  onSearch,
  loading,
}: Props) {
  const [query, setQuery] = useState(initialQuery);
  const theme = useTheme();

  return (
    <View className="flex-row gap-2 items-center mb-4">
      <TextInput
        testID="company-search-input"
        accessibilityLabel="company-search-input"
        className="flex-1 min-h-[44px] border rounded-lg px-4 py-2"
        style={{
          backgroundColor: theme.backgroundElement,
          color: theme.text,
          borderColor: theme.backgroundSelected,
        }}
        placeholder="Search ticker or name..."
        placeholderTextColor={theme.textSecondary}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={() => onSearch(query)}
        returnKeyType="search"
        autoCapitalize="none"
      />
      <TouchableOpacity
        testID="company-search-button"
        accessibilityLabel="company-search-button"
        onPress={() => onSearch(query)}
        disabled={loading}
        className="bg-blue-500 min-h-[44px] px-4 justify-center items-center rounded-lg"
      >
        <ThemedText className="text-white font-semibold flex-1 flex-col justify-center align-middle h-full text-center py-2 min-h-full">
          {loading ? '...' : 'Search'}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}
