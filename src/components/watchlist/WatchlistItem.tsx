import React from 'react';
import { TouchableOpacity, View, Alert, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { WatchlistItem as WatchlistItemType } from '@/api/watchlist';

type Props = {
  item: WatchlistItemType;
  onRemove: (ticker: string) => Promise<void>;
};

export function WatchlistItem({ item, onRemove }: Props) {
  const handleDelete = () => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to remove ${item.ticker}?`)) {
        onRemove(item.ticker);
      }
      return;
    }
    Alert.alert(
      'Remove from Watchlist',
      `Are you sure you want to remove ${item.ticker}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => onRemove(item.ticker)
        },
      ]
    );
  };

  return (
    <View className="flex-row items-center justify-between p-4 mb-2 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
      <View className="flex-1">
        <ThemedText className="text-lg font-bold">{item.ticker}</ThemedText>
        <ThemedText themeColor="textSecondary" className="text-sm">
          {item.companyName}
        </ThemedText>
      </View>
      <View className="items-end mr-4">
        <ThemedText className="text-lg font-semibold">
          {item.currentPrice ? `$${item.currentPrice.toFixed(2)}` : 'N/A'}
        </ThemedText>
        {item.lastUpdatedAt && (
          <ThemedText themeColor="textSecondary" className="text-xs">
            {new Date(item.lastUpdatedAt).toLocaleDateString()}
          </ThemedText>
        )}
      </View>
      <TouchableOpacity
        onPress={handleDelete}
        className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg"
      >
        <ThemedText className="text-red-500 text-xs font-bold">Remove</ThemedText>
      </TouchableOpacity>
    </View>
  );
}
