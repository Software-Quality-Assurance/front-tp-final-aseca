import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '../themed-text';

type Props = {
  partial: boolean;
};

export function PartialDataBadge({ partial }: Props) {
  if (!partial) return null;
  return (
    <View className="bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-md self-start my-1" testID="partial-data-badge">
      <ThemedText className="text-yellow-700 dark:text-yellow-500 text-xs font-semibold">
        Partial Data
      </ThemedText>
    </View>
  );
}
