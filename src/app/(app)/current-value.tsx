import React from 'react';
import {
  CurrentValueScreen,
  CurrentValueSafeArea,
  CurrentValueHeader,
  CurrentValueTitle,
  CurrentValueContent,
} from '@/app/styles/current-value.style';
import { CurrentValueSummary } from '@/components/portfolio/current-value/CurrentValueSummary';
import { CurrentValuePositionCard } from '@/components/portfolio/current-value/CurrentValuePositionCard';

export default function CurrentValueScreenPage() {
  return (
    <CurrentValueScreen testID="current-value-screen">
      <CurrentValueSafeArea>
        <CurrentValueHeader>
          <CurrentValueTitle>Current Value</CurrentValueTitle>
        </CurrentValueHeader>

        <CurrentValueContent>
          <CurrentValueSummary totalValue={125430} totalPnL={8430} />

          <CurrentValuePositionCard
            ticker="AAPL"
            currentValue={35000}
            profitLoss={2300}
          />

          <CurrentValuePositionCard
            ticker="TSLA"
            currentValue={18500}
            profitLoss={-500}
          />
        </CurrentValueContent>
      </CurrentValueSafeArea>
    </CurrentValueScreen>
  );
}