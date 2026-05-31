import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { ThemedText } from '@/components/themed-text'

type Props = {
  positionId: number
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

export function PositionItemActions({ positionId, onEdit, onDelete }: Props) {
  return (
    <View className="gap-2 items-end">
      <TouchableOpacity
        className="px-3 py-1.5 rounded-md border border-blue-500"
        onPress={() => onEdit?.(positionId)}
      >
        <ThemedText className="text-sm">Edit</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        className="px-3 py-1.5 rounded-md border border-red-500"
        onPress={() => onDelete?.(positionId)}
      >
        <ThemedText className="text-sm text-red-500">Delete</ThemedText>
      </TouchableOpacity>
    </View>
  )
}
