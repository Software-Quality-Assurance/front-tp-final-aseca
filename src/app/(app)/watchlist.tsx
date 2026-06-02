import React, { useState } from 'react';
import { SafeAreaView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WatchlistList } from '@/components/watchlist/WatchlistList';
import { AddWatchlistButton } from '@/components/watchlist/AddWatchlistButton';
import { AddWatchlistModal } from '@/components/watchlist/AddWatchlistModal';
import {
  screenHeaderBorderClassName,
  SharedStyles,
} from '@/app/styles/SharedStyles';

export default function WatchlistScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleSuccess() {
    setModalVisible(false);
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <ThemedView style={SharedStyles.container} testID="watchlist-screen">
      <SafeAreaView style={SharedStyles.safeArea}>
        <View
          style={[SharedStyles.screenHeader, SharedStyles.screenHeaderWithActions]}
          className={screenHeaderBorderClassName}
        >
          <ThemedText style={SharedStyles.screenTitle}>Watchlist</ThemedText>
          <AddWatchlistButton onPress={() => setModalVisible(true)} />
        </View>
        <WatchlistList refreshTrigger={refreshTrigger} />
      </SafeAreaView>

      <AddWatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </ThemedView>
  );
}
