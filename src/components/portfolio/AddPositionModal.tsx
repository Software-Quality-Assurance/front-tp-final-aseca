import React, { useState } from 'react'
import { Modal, TextInput, TouchableOpacity, View } from 'react-native'
import { usePortfolioActions } from '@/actions/portfolio'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/hooks/use-theme'

type Props = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPositionModal({ visible, onClose, onSuccess }: Props) {
  const { createOperation } = usePortfolioActions()
  const theme = useTheme()
  const [ticker, setTicker] = useState('')
  const [quantity, setQuantity] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function reset() {
    setTicker('')
    setQuantity('')
    setError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit() {
    setError(null)
    const qty = Number(quantity)
    if (!ticker.trim()) return setError('Ticker is required')
    if (!qty || qty <= 0) return setError('Quantity must be greater than 0')

    setLoading(true)
    try {
      await createOperation({ ticker: ticker.trim().toUpperCase(), type: 'BUY', quantity: qty })
      reset()
      onSuccess()
    } catch (e: any) {
      const status = e?.status
      if (status === 404) setError('Ticker not found')
      else if (status === 400) setError('Invalid quantity')
      else setError(e?.message ?? 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    backgroundColor: theme.backgroundElement,
    color: theme.text,
    borderColor: theme.backgroundSelected,
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View className="flex-1 justify-center items-center bg-black/60">
        <ThemedView className="w-80 rounded-2xl p-6 gap-4">
          <ThemedText type="subtitle" className="text-xl">Add Position</ThemedText>

          {error ? <ThemedText className="text-red-500 text-sm">{error}</ThemedText> : null}

          <View className="gap-1">
            <ThemedText className="text-sm" themeColor="textSecondary">Ticker</ThemedText>
            <TextInput
              placeholder="e.g. AAPL"
              placeholderTextColor={theme.textSecondary}
              value={ticker}
              onChangeText={t => setTicker(t.toUpperCase())}
              autoCapitalize="characters"
              className="min-h-[44px] border rounded-lg px-3 py-2"
              style={inputStyle}
            />
          </View>

          <View className="gap-1">
            <ThemedText className="text-sm" themeColor="textSecondary">Quantity</ThemedText>
            <TextInput
              placeholder="e.g. 10"
              placeholderTextColor={theme.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              className="min-h-[44px] border rounded-lg px-3 py-2"
              style={inputStyle}
            />
          </View>

          <View className="flex-row gap-3 mt-2">
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg border border-gray-400 items-center"
              onPress={handleClose}
              disabled={loading}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-1 py-3 rounded-lg bg-blue-500 items-center"
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
  )
}
