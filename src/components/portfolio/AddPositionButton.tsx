import React from 'react'
import { TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components/themed-text'

type Props = {
  onPress?: () => void
}

export function AddPositionButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      className="bg-blue-500 px-4 py-2.5 rounded-lg self-end mb-4"
      onPress={onPress}
    >
      <ThemedText className="text-white font-semibold">+ Add Position</ThemedText>
    </TouchableOpacity>
  )
}
