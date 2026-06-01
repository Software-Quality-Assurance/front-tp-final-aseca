import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WatchlistList } from '@/components/watchlist/WatchlistList';
import { AddWatchlistButton } from '@/components/watchlist/AddWatchlistButton';
import { AddWatchlistModal } from '@/components/watchlist/AddWatchlistModal';
import { useWatchlist } from '@/hooks/use-watchlist';

export default function WatchlistScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const { refresh } = useWatchlist();

  function handleSuccess() {
    setModalVisible(false);
    refresh();
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-6 pt-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <ThemedText className="text-4xl font-bold tracking-tight">
            Watchlist
          </ThemedText>
          <AddWatchlistButton onPress={() => setModalVisible(true)} />
        </View>
        <WatchlistList />
      </SafeAreaView>

      <AddWatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </ThemedView>
  );
}
