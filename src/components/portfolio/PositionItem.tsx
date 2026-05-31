import React from 'react'
import { View } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { PositionItemActions } from './PositionItemActions'
import type { Position } from '@/actions/types'

type Props = {
  position: Position
}

export function PositionItem({ position }: Props) {
  return (
    <ThemedView type="backgroundElement" className="rounded-xl p-4 mb-3 flex-row items-center justify-between">
      <View className="flex-1 gap-1">
        <ThemedText className="text-lg font-semibold">{position.companyName}</ThemedText>
        <ThemedText type="code">{position.ticker}</ThemedText>
        <View className="flex-row gap-4 mt-1">
          <View className="flex-row gap-1">
            <ThemedText themeColor="textSecondary" className="text-sm">Qty:</ThemedText>
            <ThemedText className="text-sm font-medium">{position.quantity}</ThemedText>
          </View>
          <View className="flex-row gap-1">
            <ThemedText themeColor="textSecondary" className="text-sm">Price:</ThemedText>
            <ThemedText className="text-sm font-medium">${Number(position.currentPrice).toFixed(2)}</ThemedText>
          </View>
          <View className="flex-row gap-1">
            <ThemedText themeColor="textSecondary" className="text-sm">Value:</ThemedText>
            <ThemedText className="text-sm font-medium">${Number(position.currentValue).toFixed(2)}</ThemedText>
          </View>
        </View>
        {position.warning ? (
          <ThemedText className="text-xs text-yellow-500 mt-1">{position.warning}</ThemedText>
        ) : null}
      </View>
      <PositionItemActions ticker={position.ticker} />
    </ThemedView>
  )
}
