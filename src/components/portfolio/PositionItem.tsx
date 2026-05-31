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
    <ThemedView type="backgroundElement" className="rounded-lg p-4 mb-3 flex-row items-center justify-between">
      <View className="flex-1 gap-1">
        <ThemedText type="subtitle" className="text-lg leading-6">
          {position.company}
        </ThemedText>
        <ThemedText type="code">{position.ticker}</ThemedText>
        <View className="flex-row">
          <ThemedText themeColor="textSecondary">Quantity: </ThemedText>
          <ThemedText>{position.quantity}</ThemedText>
        </View>
        <View className="flex-row">
          <ThemedText themeColor="textSecondary">Ref. Price: </ThemedText>
          <ThemedText>${position.referencePrice.toFixed(2)}</ThemedText>
        </View>
      </View>
      <PositionItemActions positionId={position.id} />
    </ThemedView>
  )
}
