import React, { useState } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { usePortfolioActions } from '@/actions/portfolio';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Props = {
  ticker: string;
  quantity: number;
  onSuccess: () => void;
};

export function DeletePositionButton({ ticker, quantity, onSuccess }: Props) {
  const { createOperation } = usePortfolioActions();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await createOperation({ ticker, type: 'SELL', quantity });
      setVisible(false);
      onSuccess();
    } catch (e: any) {
      const status = e?.status;
      if (status === 422) setError(e?.message ?? 'Insufficient shares to sell');
      else setError(e?.message ?? 'Failed to sell position');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TouchableOpacity
        testID={`delete-position-button-${ticker}`}
        accessibilityLabel={`delete-position-button-${ticker}`}
        className="px-3 py-1.5 rounded-lg border border-red-500"
        onPress={() => setVisible(true)}
      >
        <ThemedText className="text-sm text-red-500">Delete</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <ThemedView
            testID="delete-position-modal"
            accessibilityLabel="delete-position-modal"
            className="w-72 rounded-2xl p-6 gap-4"
          >
            <ThemedText className="text-xl font-semibold">
              Sell All Shares
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              This will sell all{' '}
              <ThemedText className="font-bold">
                {quantity} shares of {ticker}
              </ThemedText>{' '}
              at the current price. The operation will be recorded in your
              history.
            </ThemedText>

            {error ? (
              <ThemedText className="text-red-500 text-sm">{error}</ThemedText>
            ) : null}

            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                testID="delete-position-cancel-button"
                accessibilityLabel="delete-position-cancel-button"
                className="flex-1 py-3 rounded-lg border border-gray-400 items-center"
                onPress={() => {
                  setVisible(false);
                  setError(null);
                }}
                disabled={loading}
              >
                <ThemedText>No</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                testID="delete-position-confirm-button"
                accessibilityLabel="delete-position-confirm-button"
                className="flex-1 py-3 rounded-lg bg-red-500 items-center"
                onPress={handleConfirm}
                disabled={loading}
              >
                <ThemedText className="text-white font-semibold">
                  {loading ? 'Selling...' : 'Yes, sell all'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}
