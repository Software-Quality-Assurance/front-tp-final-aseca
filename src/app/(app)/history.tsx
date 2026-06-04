import React from 'react';
import { useHistory } from '@/hooks/use-history';
import { HistoryFilterBar } from '@/components/portfolio/history/HistoryFilterBar';
import { HistoryList } from '@/components/portfolio/history/HistoryList';
import {
  HistoryScreen,
  HistorySafeArea,
  HistoryHeader,
  HistoryTitle,
} from '@/app/styles/history.style';

export default function HistoryScreenPage() {
  const {
    grouped,
    isLoading,
    error,
    filterType,
    filterStatus,
    setFilterType,
    setFilterStatus,
    refresh,
  } = useHistory();

  return (
    <HistoryScreen>
      <HistorySafeArea>
        <HistoryHeader>
          <HistoryTitle>History</HistoryTitle>
        </HistoryHeader>

        <HistoryFilterBar
          filterType={filterType}
          filterStatus={filterStatus}
          onTypeChange={setFilterType}
          onStatusChange={setFilterStatus}
        />

        <HistoryList
          grouped={grouped}
          isLoading={isLoading}
          error={error}
          onRefresh={refresh}
        />
      </HistorySafeArea>
    </HistoryScreen>
  );
}
