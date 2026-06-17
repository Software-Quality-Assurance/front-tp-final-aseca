import React from 'react';
import { ActivityIndicator } from 'react-native';
import {
  CurrentValueScreen,
  CurrentValueSafeArea,
  CurrentValueHeader,
  CurrentValueTitle,
  CurrentValueContent,
  CurrentValueCenteredContent,
} from '@/app/styles/current-value.style';
import { CurrentValueSummary } from '@/components/portfolio/current-value/CurrentValueSummary';
import { CurrentValuePositionCard } from '@/components/portfolio/current-value/CurrentValuePositionCard';
import { ThemedText } from '@/components/themed-text';
import { useCurrentValue } from '@/hooks/use-current-value';

export default function CurrentValueScreenPage() {
  const { summary, positions, isLoading, error } = useCurrentValue();

  const hasPositions = positions.length > 0;

  return (
    <CurrentValueScreen testID="current-value-screen">
      <CurrentValueSafeArea>
        <CurrentValueHeader>
          <CurrentValueTitle>Current Value</CurrentValueTitle>
        </CurrentValueHeader>

        <CurrentValueContent>
          {isLoading ? (
            <CurrentValueCenteredContent testID="current-value-loading">
              <ActivityIndicator size="large" />
              <ThemedText className="mt-4 text-lg font-semibold">
                Loading current value...
              </ThemedText>
            </CurrentValueCenteredContent>
          ) : error ? (
            <CurrentValueCenteredContent testID="current-value-error">
              <ThemedText className="text-lg font-semibold text-red-500">
                {error}
              </ThemedText>
            </CurrentValueCenteredContent>
          ) : !summary || !hasPositions ? (
            <CurrentValueCenteredContent testID="current-value-empty-state">
              <ThemedText className="text-5xl">📈</ThemedText>
              <ThemedText className="mt-2 text-lg font-semibold">
                No positions yet
              </ThemedText>
              <ThemedText themeColor="textSecondary" className="text-sm">
                Buy stocks to see your current value breakdown.
              </ThemedText>
            </CurrentValueCenteredContent>
          ) : (
            <>
              <CurrentValueSummary
                totalValue={summary.totalValue}
                totalPnL={summary.totalProfitLoss}
                totalPnLPercentage={summary.totalProfitLossPercentage}
              />

              {positions.map((position) => (
                <CurrentValuePositionCard
                  key={position.ticker}
                  ticker={position.ticker}
                  companyName={position.companyName}
                  currentValue={position.currentValue}
                  profitLoss={position.profitLoss}
                  profitLossPercentage={position.profitLossPercentage}
                />
              ))}
            </>
          )}
        </CurrentValueContent>
      </CurrentValueSafeArea>
    </CurrentValueScreen>
  );
}