import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { WatchlistList } from '@/components/watchlist/WatchlistList';
import { AddWatchlistButton } from '@/components/watchlist/AddWatchlistButton';
import { AddWatchlistModal } from '@/components/watchlist/AddWatchlistModal';
import { ComparisonModal } from '@/components/edgar/ComparisonModal';
import { ThemedText } from '@/components/themed-text';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/hooks/use-theme';
import {
  WatchlistScreen,
  WatchlistSafeArea,
  WatchlistHeader,
  WatchlistTitle,
} from '@/app/styles/watchlist.style';

export default function WatchlistScreenPage() {
  const theme = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [comparisonVisible, setComparisonVisible] = useState(false);
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
          <View className="flex-row flex-1 justify-end gap-3">
            <TouchableOpacity 
              onPress={() => setComparisonVisible(true)}
              className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full flex-row items-center"
              testID="compare-button"
              accessibilityLabel="compare-button"
            >
              <Ionicons name="bar-chart" size={16} color={theme.text} />
              <ThemedText className="ml-1 text-xs font-bold" themeColor="text">Compare</ThemedText>
            </TouchableOpacity>
            <AddWatchlistButton onPress={() => setModalVisible(true)} />
          </View>
        </WatchlistHeader>
        <WatchlistList refreshTrigger={refreshTrigger} />
      </WatchlistSafeArea>

      <AddWatchlistModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
      
      <ComparisonModal
        visible={comparisonVisible}
        onClose={() => setComparisonVisible(false)}
      />
    </WatchlistScreen>
  );
}
