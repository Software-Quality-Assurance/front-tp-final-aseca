import React, { useState } from 'react';
import { WatchlistList } from '@/components/watchlist/WatchlistList';
import { AddWatchlistButton } from '@/components/watchlist/AddWatchlistButton';
import { AddWatchlistModal } from '@/components/watchlist/AddWatchlistModal';
import {
  WatchlistScreen,
  WatchlistSafeArea,
  WatchlistHeader,
  WatchlistTitle,
} from '@/app/styles/WatchlistStyles';

export default function WatchlistScreenPage() {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  function handleSuccess() {
    setModalVisible(false);
    setRefreshTrigger((prev) => prev + 1);
  }

  return (
    <WatchlistScreen testID="watchlist-screen">
      <WatchlistSafeArea>
        <WatchlistHeader>
          <WatchlistTitle>Watchlist</WatchlistTitle>
          <AddWatchlistButton onPress={() => setModalVisible(true)} />
        </WatchlistHeader>
        <WatchlistList refreshTrigger={refreshTrigger} />
      </WatchlistSafeArea>

      <AddWatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </WatchlistScreen>
  );
}
