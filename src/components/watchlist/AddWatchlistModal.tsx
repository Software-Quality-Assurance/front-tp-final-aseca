import React, { useState } from 'react';
import { Modal, TextInput, TouchableOpacity, View } from 'react-native';
import { useWatchlistApi } from '@/actions/watchlist';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export function AddWatchlistModal({ visible, onClose, onSuccess }: Props) {
  const { addToWatchlist } = useWatchlistApi();
  const theme = useTheme();

  const [ticker, setTicker] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function reset() {
    setTicker('');
    setError(null);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleSubmit() {
    setError(null);
    if (!ticker.trim()) return setError('Ticker is required');

    setLoading(true);
    try {
      await addToWatchlist(ticker.trim().toUpperCase());
      reset();
      onSuccess();
    } catch (e: any) {
      const status = e?.status;
      if (status === 404) setError('Ticker not found');
      else if (status === 409) setError('Ticker already in watchlist');
      else setError(e?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: theme.backgroundElement,
    color: theme.text,
    borderColor: theme.backgroundSelected,
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60">
        <ThemedView
          testID="add-watchlist-modal"
          className="w-80 rounded-2xl p-6 gap-4"
        >
          <ThemedText className="text-xl font-semibold">
            Add to Watchlist
          </ThemedText>

          {error ? (
            <ThemedText
              testID="add-watchlist-error"
              className="text-red-500 text-sm"
            >
              {error}
            </ThemedText>
          ) : null}

          {/* Ticker */}
          <View className="gap-1">
            <ThemedText className="text-sm" themeColor="textSecondary">
              Ticker
            </ThemedText>
            <TextInput
              testID="add-watchlist-ticker-input"
              placeholder="e.g. MSFT"
              placeholderTextColor={theme.textSecondary}
              value={ticker}
              onChangeText={(t) => setTicker(t.toUpperCase())}
              autoCapitalize="characters"
              className="min-h-[44px] border rounded-lg px-3 py-2"
              style={inputStyle}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg border border-gray-400 items-center"
              onPress={handleClose}
              disabled={loading}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              testID="add-watchlist-submit-button"
              className="flex-1 py-3 rounded-lg items-center bg-blue-500"
              onPress={handleSubmit}
              disabled={loading}
            >
              <ThemedText className="text-white font-semibold">
                {loading ? 'Adding...' : 'Add'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}
