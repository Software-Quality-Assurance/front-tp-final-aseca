import React from 'react'
import { TouchableOpacity } from 'react-native'
import { ThemedText } from '@/components/themed-text'

type Props = {
  onPress?: () => void
}

export function AddPositionButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      className="bg-blue-600 px-5 py-2.5 rounded-xl flex-row items-center gap-1 shadow-sm"
      onPress={onPress}
    >
      <ThemedText className="text-white font-semibold text-base">+ Add</ThemedText>
    </TouchableOpacity>
  )
}
