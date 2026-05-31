import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { AddPositionButton } from '@/components/portfolio/AddPositionButton'
import { PositionList } from '@/components/portfolio/PositionList'

export default function PortfolioScreen() {
  return (
    <ThemedView className="flex-1">
      <SafeAreaView className="flex-1 p-4">
        <ThemedText type="title" className="text-3xl mb-4">
          Portfolio
        </ThemedText>
        <AddPositionButton />
        <PositionList />
      </SafeAreaView>
    </ThemedView>
  )
}
