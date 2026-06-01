import React from 'react';
import { SafeAreaView, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function HistoryScreen() {
  return (
    <ThemedView className="flex-1">
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-row items-center px-6 pt-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <ThemedText className="text-4xl font-bold tracking-tight">
            History
          </ThemedText>
        </View>
        <View className="flex-1 items-center justify-center">
          <ThemedText themeColor="textSecondary">Coming soon</ThemedText>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}
