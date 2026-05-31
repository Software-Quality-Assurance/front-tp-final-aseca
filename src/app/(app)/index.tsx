import React, { useState } from 'react'
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native'
import { useRouter } from 'expo-router'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { AddPositionButton } from '@/components/portfolio/AddPositionButton'
import { AddPositionModal } from '@/components/portfolio/AddPositionModal'
import { PositionList } from '@/components/portfolio/PositionList'

export default function PortfolioScreen() {
  const router = useRouter()
  const [modalVisible, setModalVisible] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  function handleSuccess() {
    setModalVisible(false)
    setRefreshTrigger(t => t + 1)
  }

  return (
    <ThemedView className="flex-1">
      <SafeAreaView style={{ flex: 1 }}>
        <View className="flex-row items-center justify-between px-6 pt-8 pb-4 border-b border-gray-200 dark:border-gray-800">
          <ThemedText className="text-4xl font-bold tracking-tight">Portfolio</ThemedText>
          <AddPositionButton onPress={() => setModalVisible(true)} />
        </View>

        <View className="px-6 pt-3 pb-1">
          <TouchableOpacity
            className="flex-row items-center gap-2 self-start"
            onPress={() => router.push('/current-value')}
          >
            <Text className="text-blue-500 font-medium text-sm">View Current Value →</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-1 px-6 pt-2">
          <PositionList refreshTrigger={refreshTrigger} onRefresh={() => setRefreshTrigger(t => t + 1)} />
        </View>
      </SafeAreaView>

      <AddPositionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSuccess={handleSuccess}
      />
    </ThemedView>
  )
}
