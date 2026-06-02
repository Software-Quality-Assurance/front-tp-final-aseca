import React from 'react';
import { ThemedText } from '@/components/themed-text';
import {
  HistoryScreen,
  HistorySafeArea,
  HistoryHeader,
  HistoryTitle,
  HistoryCenteredContent,
} from '@/app/styles/HistoryStyles';

export default function HistoryScreenPage() {
  return (
    <HistoryScreen>
      <HistorySafeArea>
        <HistoryHeader>
          <HistoryTitle>History</HistoryTitle>
        </HistoryHeader>
        <HistoryCenteredContent>
          <ThemedText themeColor="textSecondary">Coming soon</ThemedText>
        </HistoryCenteredContent>
      </HistorySafeArea>
    </HistoryScreen>
  );
}
