import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '@/hooks/useAuth';
import { usePortfolioActions } from '@/actions/portfolio';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { PositionItem } from './PositionItem';
import type { Position } from '@/actions/types';

type Props = {
  refreshTrigger?: number;
  onRefresh: () => void;
};

export function PositionList({ refreshTrigger = 0, onRefresh }: Props) {
  const { user } = useAuth();
  const { getPortfolio } = usePortfolioActions();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    getPortfolio()
      .then(setPositions)
      .catch((e: any) => setError(e.message ?? 'Failed to load portfolio'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, refreshTrigger]);

  if (loading) return <ActivityIndicator className="mt-8" size="large" />;

  if (error)
    return <ThemedText className="text-red-500 mt-4">{error}</ThemedText>;

  if (positions.length === 0) {
    return (
      <ThemedView
        testID="portfolio-empty-state"
        className="flex-1 items-center justify-center gap-2"
      >
        <ThemedText className="text-5xl">📭</ThemedText>
        <ThemedText className="text-lg font-semibold">
          No positions yet
        </ThemedText>
        <ThemedText themeColor="textSecondary" className="text-sm">
          Add your first position to get started.
        </ThemedText>
      </ThemedView>
    );
  }

  const items = [];
  for (const position of positions) {
    items.push(
      <PositionItem
        key={position.ticker}
        position={position}
        onRefresh={onRefresh}
      />
    );
  }

  return (
    <ScrollView testID="portfolio-position-list" className="flex-1">
      {items}
    </ScrollView>
  );
}
