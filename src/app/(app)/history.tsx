import React, { useState } from 'react';
import { useHistory } from '@/hooks/use-history';
import { HistoryFilterBar } from '@/components/portfolio/history/HistoryFilterBar';
import { HistoryList } from '@/components/portfolio/history/HistoryList';
import { EditHistoryModal } from '@/components/portfolio/history/EditHistoryModal';
import type { Operation } from '@/actions/types';
import {
  HistoryScreen,
  HistorySafeArea,
  HistoryHeader,
  HistoryTitle,
} from '@/app/styles/history.style';

export default function HistoryScreenPage() {
  const { operations, isLoading, error, filterType, setFilterType, refresh } =
    useHistory();
  const [editingOperation, setEditingOperation] = useState<Operation | null>(
    null
  );

  function handleEditSuccess() {
    setEditingOperation(null);
    refresh();
  }

  return (
    <HistoryScreen testID="history-screen">
      <HistorySafeArea>
        <HistoryHeader>
          <HistoryTitle>History</HistoryTitle>
        </HistoryHeader>

        <HistoryFilterBar
          filterType={filterType}
          onTypeChange={setFilterType}
        />

        <HistoryList
          operations={operations}
          isLoading={isLoading}
          error={error}
          onEdit={setEditingOperation}
          onRefresh={refresh}
        />
      </HistorySafeArea>

      <EditHistoryModal
        operation={editingOperation}
        onClose={() => setEditingOperation(null)}
        onSuccess={handleEditSuccess}
      />
    </HistoryScreen>
  );
}
