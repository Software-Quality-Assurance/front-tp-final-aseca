import React, { useEffect, useState } from 'react';
import { Modal, TextInput, TouchableOpacity, View } from 'react-native';
import { usePortfolioActions } from '@/actions/portfolio';
import type { Operation, OperationType } from '@/actions/types';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  operation: Operation | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function EditHistoryModal({ operation, onClose, onSuccess }: Props) {
  const { patchOperation } = usePortfolioActions();
  const theme = useTheme();

  const [type, setType] = useState<OperationType>('BUY');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (operation) {
      setType(operation.type);
      setQuantity(String(operation.quantity));
      setError(null);
    }
  }, [operation]);

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit() {
    if (!operation) return;
    setError(null);
    const qty = Number(quantity);
    if (!qty || qty <= 0 || !Number.isInteger(qty))
      return setError('Quantity must be a whole number ≥ 1');

    setLoading(true);
    try {
      await patchOperation(operation.id, { type, quantity: qty });
      onSuccess();
    } catch (e: any) {
      const status = e?.status;
      if (status === 404) setError('History entry not found');
      else if (status === 422)
        setError(e?.message || 'This change would leave negative holdings');
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
      visible={operation !== null}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-black/60">
        <ThemedView
          testID="edit-history-modal"
          className="w-80 rounded-2xl p-6 gap-4"
        >
          <ThemedText className="text-xl font-semibold">
            Edit Operation
          </ThemedText>

          {operation ? (
            <ThemedText themeColor="textSecondary" className="text-sm">
              {operation.ticker} · {operation.companyName}
            </ThemedText>
          ) : null}

          {/* BUY / SELL toggle */}
          <View className="flex-row rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
            <TouchableOpacity
              testID="edit-history-buy-button"
              className={`flex-1 py-2.5 items-center ${type === 'BUY' ? 'bg-green-500' : ''}`}
              onPress={() => setType('BUY')}
            >
              <ThemedText
                className={`font-semibold ${type === 'BUY' ? 'text-white' : ''}`}
              >
                BUY
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              testID="edit-history-sell-button"
              className={`flex-1 py-2.5 items-center ${type === 'SELL' ? 'bg-red-500' : ''}`}
              onPress={() => setType('SELL')}
            >
              <ThemedText
                className={`font-semibold ${type === 'SELL' ? 'text-white' : ''}`}
              >
                SELL
              </ThemedText>
            </TouchableOpacity>
          </View>

          {error ? (
            <ThemedText
              testID="edit-history-error"
              className="text-red-500 text-sm"
            >
              {error}
            </ThemedText>
          ) : null}

          {/* Quantity */}
          <View className="gap-1">
            <ThemedText className="text-sm" themeColor="textSecondary">
              Quantity
            </ThemedText>
            <TextInput
              testID="edit-history-quantity-input"
              placeholder="e.g. 10"
              placeholderTextColor={theme.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              className="min-h-[44px] border rounded-lg px-3 py-2"
              style={inputStyle}
            />
          </View>

          {/* Actions */}
          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              testID="edit-history-cancel-button"
              className="flex-1 py-3 rounded-lg border border-gray-400 items-center"
              onPress={handleClose}
              disabled={loading}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              testID="edit-history-submit-button"
              className="flex-1 py-3 rounded-lg items-center bg-blue-500"
              onPress={handleSubmit}
              disabled={loading}
            >
              <ThemedText className="text-white font-semibold">
                {loading ? 'Saving...' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}
