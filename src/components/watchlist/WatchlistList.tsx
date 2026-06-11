import React, { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  View,
  RefreshControl,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WatchlistItem } from './WatchlistItem';
import { useWatchlist } from '@/hooks/use-watchlist';

type Props = {
  refreshTrigger?: number;
};

export function WatchlistList({ refreshTrigger = 0 }: Props) {
  const { items, loading, error, refresh, removeTicker } = useWatchlist();

  useEffect(() => {
    refresh();
  }, [refreshTrigger, refresh]);

  if (loading && items.length === 0) {
    return <ActivityIndicator className="mt-8" size="large" />;
  }

  if (error) {
    return <ThemedText className="text-red-500 mt-4 px-6">{error}</ThemedText>;
  }

  if (items.length === 0) {
    return (
      <ThemedView
        testID="watchlist-empty-state"
        className="flex-1 items-center justify-center gap-2"
      >
        <ThemedText className="text-5xl">🔭</ThemedText>
        <ThemedText className="text-lg font-semibold">
          Your watchlist is empty
        </ThemedText>
        <ThemedText themeColor="textSecondary" className="text-sm">
          Follow companies to monitor their performance.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      testID="watchlist-list"
      className="flex-1 px-6"
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
    >
      <View className="py-4">
        {items.map((item) => (
          <WatchlistItem key={item.id} item={item} onRemove={removeTicker} />
        ))}
      </View>
    </ScrollView>
  );
}
