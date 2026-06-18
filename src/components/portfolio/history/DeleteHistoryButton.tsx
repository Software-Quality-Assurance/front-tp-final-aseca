import React, { useState } from 'react';
import { Modal, TouchableOpacity, View } from 'react-native';
import { usePortfolioActions } from '@/actions/portfolio';
import type { Operation } from '@/actions/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Props = {
  operation: Operation;
  onSuccess: () => void;
};

export function DeleteHistoryButton({ operation, onSuccess }: Props) {
  const { deleteOperation } = usePortfolioActions();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setLoading(true);
    setError(null);
    try {
      await deleteOperation(operation.id);
      setVisible(false);
      onSuccess();
    } catch (e: any) {
      const status = e?.status;
      if (status === 422)
        setError(e?.message ?? 'This would leave negative holdings');
      else if (status === 404) setError('History entry not found');
      else setError(e?.message ?? 'Failed to delete entry');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <TouchableOpacity
        testID={`delete-history-button-${operation.id}`}
        className="px-2 py-1 rounded-lg border border-red-500"
        onPress={() => setVisible(true)}
      >
        <ThemedText className="text-xs text-red-500">Delete</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/60">
          <ThemedView
            testID="delete-history-modal"
            className="w-72 rounded-2xl p-6 gap-4"
          >
            <ThemedText className="text-xl font-semibold">
              Delete Entry
            </ThemedText>
            <ThemedText themeColor="textSecondary">
              This will permanently delete the{' '}
              <ThemedText className="font-bold">
                {operation.type} {operation.quantity} {operation.ticker}
              </ThemedText>{' '}
              entry from your history.
            </ThemedText>

            {error ? (
              <ThemedText className="text-red-500 text-sm">{error}</ThemedText>
            ) : null}

            <View className="flex-row gap-3 mt-2">
              <TouchableOpacity
                testID="delete-history-cancel-button"
                className="flex-1 py-3 rounded-lg border border-gray-400 items-center"
                onPress={() => {
                  setVisible(false);
                  setError(null);
                }}
                disabled={loading}
              >
                <ThemedText>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                testID="delete-history-confirm-button"
                className="flex-1 py-3 rounded-lg bg-red-500 items-center"
                onPress={handleConfirm}
                disabled={loading}
              >
                <ThemedText className="text-white font-semibold">
                  {loading ? 'Deleting...' : 'Delete'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}
