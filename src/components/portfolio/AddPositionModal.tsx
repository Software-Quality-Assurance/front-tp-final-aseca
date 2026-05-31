import React, { useState } from 'react'
import { Modal, Switch, TextInput, TouchableOpacity, View } from 'react-native'
import { usePortfolioActions } from '@/actions/portfolio'
import type { OperationType } from '@/actions/types'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { useTheme } from '@/hooks/use-theme'

type Props = {
  visible: boolean
  onClose: () => void
  onSuccess: () => void
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function parseDate(dateStr: string): number | undefined {
  const ms = new Date(dateStr).getTime()
  return isNaN(ms) ? undefined : ms
}

export function AddPositionModal({ visible, onClose, onSuccess }: Props) {
  const { createOperation } = usePortfolioActions()
  const theme = useTheme()

  const [type, setType] = useState<OperationType>('BUY')
  const [ticker, setTicker] = useState('')
  const [quantity, setQuantity] = useState('')
  const [isNow, setIsNow] = useState(true)
  const [date, setDate] = useState(todayString())
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function reset() {
    setType('BUY')
    setTicker('')
    setQuantity('')
    setIsNow(true)
    setDate(todayString())
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
    if (!qty || qty <= 0 || !Number.isInteger(qty)) return setError('Quantity must be a whole number ≥ 1')
    if (!isNow && !parseDate(date)) return setError('Invalid date format (YYYY-MM-DD)')

    setLoading(true)
    try {
      await createOperation({
        ticker: ticker.trim().toUpperCase(),
        type,
        quantity: qty,
        timestampMs: isNow ? undefined : parseDate(date),
      })
      reset()
      onSuccess()
    } catch (e: any) {
      const status = e?.status
      if (status === 404) setError('Ticker not found')
      else if (status === 422) setError(e?.message || 'No price available or insufficient shares')
      else setError(e?.message || 'Something went wrong')
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
        <ThemedView testID="add-position-modal" className="w-80 rounded-2xl p-6 gap-4">

          <ThemedText className="text-xl font-semibold">Register Operation</ThemedText>

          {/* BUY / SELL toggle */}
          <View className="flex-row rounded-xl overflow-hidden border border-gray-300 dark:border-gray-700">
            <TouchableOpacity
              testID="add-position-buy-button"
              className={`flex-1 py-2.5 items-center ${type === 'BUY' ? 'bg-green-500' : ''}`}
              onPress={() => setType('BUY')}
            >
              <ThemedText className={`font-semibold ${type === 'BUY' ? 'text-white' : ''}`}>BUY</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              testID="add-position-sell-button"
              className={`flex-1 py-2.5 items-center ${type === 'SELL' ? 'bg-red-500' : ''}`}
              onPress={() => setType('SELL')}
            >
              <ThemedText className={`font-semibold ${type === 'SELL' ? 'text-white' : ''}`}>SELL</ThemedText>
            </TouchableOpacity>
          </View>

          {error ? <ThemedText testID="add-position-error" className="text-red-500 text-sm">{error}</ThemedText> : null}

          {/* Ticker */}
          <View className="gap-1">
            <ThemedText className="text-sm" themeColor="textSecondary">Ticker</ThemedText>
            <TextInput
              testID="add-position-ticker-input"
              placeholder="e.g. AAPL"
              placeholderTextColor={theme.textSecondary}
              value={ticker}
              onChangeText={t => setTicker(t.toUpperCase())}
              autoCapitalize="characters"
              className="min-h-[44px] border rounded-lg px-3 py-2"
              style={inputStyle}
            />
          </View>

          {/* Quantity */}
          <View className="gap-1">
            <ThemedText className="text-sm" themeColor="textSecondary">Quantity</ThemedText>
            <TextInput
              testID="add-position-quantity-input"
              placeholder="e.g. 10"
              placeholderTextColor={theme.textSecondary}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              className="min-h-[44px] border rounded-lg px-3 py-2"
              style={inputStyle}
            />
          </View>

          {/* Now toggle */}
          <View className="flex-row items-center justify-between">
            <ThemedText className="text-sm" themeColor="textSecondary">Use current date & time</ThemedText>
            <TouchableOpacity testID="add-position-now-switch" onPress={() => setIsNow(v => !v)}>
              <Switch value={isNow} onValueChange={setIsNow} pointerEvents="none" />
            </TouchableOpacity>
          </View>

          {/* Date picker (only when not now) */}
          {!isNow && (
            <View className="gap-1">
              <ThemedText className="text-sm" themeColor="textSecondary">Operation date (YYYY-MM-DD)</ThemedText>
              <TextInput
                testID="add-position-date-input"
                placeholder="2026-05-31"
                placeholderTextColor={theme.textSecondary}
                value={date}
                onChangeText={setDate}
                className="min-h-[44px] border rounded-lg px-3 py-2"
                style={inputStyle}
              />
            </View>
          )}

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
              testID="add-position-submit-button"
              className={`flex-1 py-3 rounded-lg items-center ${type === 'BUY' ? 'bg-green-500' : 'bg-red-500'}`}
              onPress={handleSubmit}
              disabled={loading}
            >
              <ThemedText className="text-white font-semibold">
                {loading ? 'Processing...' : type === 'BUY' ? 'Buy' : 'Sell'}
              </ThemedText>
            </TouchableOpacity>
          </View>

        </ThemedView>
      </View>
    </Modal>
  )
}
