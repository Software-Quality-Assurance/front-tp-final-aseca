import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { WatchlistList } from '@/components/watchlist/WatchlistList';
import { AddWatchlistModal } from '@/components/watchlist/AddWatchlistModal';

export default function WatchlistScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleSuccess() {
    setModalVisible(false);
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <ThemedView className="flex-1" testID="watchlist-screen">
      <Stack.Screen options={{ title: 'Stock Watchlist', headerShown: true }} />

      <View className="flex-1 pt-2">
        <WatchlistList refreshTrigger={refreshTrigger} />
      </View>

      <TouchableOpacity
        testID="add-watchlist-button"
        onPress={() => setModalVisible(true)}
        className="absolute bottom-10 right-10 w-16 h-16 bg-blue-500 rounded-full items-center justify-center shadow-lg"
      >
        <ThemedText className="text-white text-3xl">+</ThemedText>
      </TouchableOpacity>

      <AddWatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </ThemedView>
  );
}
