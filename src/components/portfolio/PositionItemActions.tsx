import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

type Props = {
  ticker: string;
  onEdit?: (ticker: string) => void;
  onDelete?: (ticker: string) => void;
};

export function PositionItemActions({ ticker, onEdit, onDelete }: Props) {
  return (
    <View className="gap-2 items-end ml-3">
      <TouchableOpacity
        className="px-3 py-1.5 rounded-lg border border-blue-500"
        onPress={() => onEdit?.(ticker)}
      >
        <ThemedText className="text-sm text-blue-500">Edit</ThemedText>
      </TouchableOpacity>
      <TouchableOpacity
        className="px-3 py-1.5 rounded-lg border border-red-500"
        onPress={() => onDelete?.(ticker)}
      >
        <ThemedText className="text-sm text-red-500">Delete</ThemedText>
      </TouchableOpacity>
    </View>
  );
}
