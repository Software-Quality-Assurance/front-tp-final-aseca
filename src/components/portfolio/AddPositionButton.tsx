import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

type Props = {
  onPress?: () => void
}

export function AddPositionButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      testID="portfolio-add-button"
      className="bg-blue-600 px-5 py-2.5 rounded-xl flex-row items-center gap-1 shadow-sm"
      onPress={onPress}
    >
      <Text className="text-white font-semibold text-base">+ Add</Text>
    </TouchableOpacity>
  )
}
