import React, { useEffect } from 'react';
import {
  View,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ThemedText } from '../themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useEdgarComparison } from '@/hooks/use-edgar-comparison';
import { ComparisonTable } from './ComparisonTable';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ComparisonModal({ visible, onClose }: Props) {
  const theme = useTheme();
  const { data, loading, error, fetchComparison } = useEdgarComparison();

  useEffect(() => {
    if (visible) {
      fetchComparison();
    }
  }, [visible, fetchComparison]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1" style={{ backgroundColor: theme.background }}>
        <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 pt-12">
          <ThemedText className="text-xl font-bold">
            Compare Companies
          </ThemedText>
          <TouchableOpacity
            onPress={onClose}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full"
            testID="comparison-close"
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 p-4"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
          testID="comparison-modal-content"
        >
          {loading ? (
            <ActivityIndicator size="large" className="my-10" />
          ) : error ? (
            <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl items-center">
              <Ionicons
                name="warning"
                size={32}
                color="#ef4444"
                className="mb-2"
              />
              <ThemedText className="text-red-600 dark:text-red-400 text-center">
                {error}
              </ThemedText>
              <TouchableOpacity
                onPress={fetchComparison}
                className="mt-4 bg-red-100 dark:bg-red-800 px-4 py-2 rounded-lg"
              >
                <ThemedText className="font-semibold text-red-700 dark:text-red-300">
                  Retry
                </ThemedText>
              </TouchableOpacity>
            </View>
          ) : data ? (
            <View>
              {data.warning && (
                <View
                  className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800/50 flex-row items-center gap-3 mb-4"
                  testID="comparison-warning"
                >
                  <Ionicons
                    name="information-circle"
                    size={24}
                    color={theme.text}
                    className="text-yellow-500"
                  />
                  <ThemedText className="flex-1 text-sm text-yellow-800 dark:text-yellow-400">
                    {data.warning}
                  </ThemedText>
                </View>
              )}

              {data.companies.length > 0 ? (
                <ComparisonTable companies={data.companies} />
              ) : (
                <View
                  className="items-center justify-center py-10 opacity-50 text-center"
                  testID="comparison-empty"
                >
                  <Ionicons
                    name="bar-chart"
                    size={48}
                    color={theme.textSecondary}
                  />
                  <ThemedText
                    className="mt-4 text-center"
                    themeColor="textSecondary"
                  >
                    No companies in your portfolio or watchlist yet.
                  </ThemedText>
                </View>
              )}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </Modal>
  );
}
