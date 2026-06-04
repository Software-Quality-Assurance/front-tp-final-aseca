import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePortfolioActions } from '@/actions/portfolio';
import {
  HistoryFilterStatus,
  HistoryFilterType,
  TransactionStatus,
} from '@/types/history.types';
import type { Operation } from '@/actions/types';

function deriveStatus(_operation: Operation): TransactionStatus {
  return 'COMPLETED';
}

export interface EnrichedOperation extends Operation {
  status: TransactionStatus;
}

export interface GroupedOperations {
  status: TransactionStatus;
  label: string;
  data: EnrichedOperation[];
}

const STATUS_LABELS: Record<TransactionStatus, string> = {
  COMPLETED: 'Completadas',
  PENDING: 'Pendientes',
  REJECTED: 'Rechazadas',
};

const STATUS_ORDER: TransactionStatus[] = ['PENDING', 'COMPLETED', 'REJECTED'];

interface UseHistoryReturn {
  grouped: GroupedOperations[];
  isLoading: boolean;
  error: string | null;
  filterType: HistoryFilterType;
  filterStatus: HistoryFilterStatus;
  setFilterType: (type: HistoryFilterType) => void;
  setFilterStatus: (status: HistoryFilterStatus) => void;
  refresh: () => void;
}

export function useHistory(): UseHistoryReturn {
  const { getPortfolioHistory } = usePortfolioActions();

  const [raw, setRaw] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<HistoryFilterType>('ALL');
  const [filterStatus, setFilterStatus] = useState<HistoryFilterStatus>('ALL');

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getPortfolioHistory();
      setRaw(data);
    } catch {
      setError('No se pudo cargar el historial. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  }, [getPortfolioHistory]);

  useEffect(() => {
    load();
  }, [load]);

  const grouped = useMemo<GroupedOperations[]>(() => {
    const enriched: EnrichedOperation[] = raw
      .map((op) => ({ ...op, status: deriveStatus(op) }))
      .filter((op) => filterType === 'ALL' || op.type === filterType)
      .filter((op) => filterStatus === 'ALL' || op.status === filterStatus);

    const byStatus = new Map<TransactionStatus, EnrichedOperation[]>();
    for (const op of enriched) {
      const bucket = byStatus.get(op.status) ?? [];
      bucket.push(op);
      byStatus.set(op.status, bucket);
    }

    return STATUS_ORDER.filter((s) => byStatus.has(s)).map((s) => ({
      status: s,
      label: STATUS_LABELS[s],
      data: byStatus.get(s)!,
    }));
  }, [raw, filterType, filterStatus]);

  return {
    grouped,
    isLoading,
    error,
    filterType,
    filterStatus,
    setFilterType,
    setFilterStatus,
    refresh: load,
  };
}
