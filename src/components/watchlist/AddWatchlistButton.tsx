import React from 'react';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type Props = {
  onPress: () => void;
};

export function AddWatchlistButton({ onPress }: Props) {
  return (
    <TouchableOpacity
      testID="add-watchlist-button"
      accessibilityLabel="add-watchlist-button"
      onPress={onPress}
      className="bg-blue-500 rounded-full w-10 h-10 items-center justify-center shadow-lg active:opacity-80"
    >
      <MaterialCommunityIcons name="plus" size={24} color="white" />
    </TouchableOpacity>
  );
}
