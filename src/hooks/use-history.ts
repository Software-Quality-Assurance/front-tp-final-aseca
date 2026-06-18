import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { usePortfolioActions } from '@/actions/portfolio';
import { HistoryFilterType } from '@/types/history.types';
import type { Operation } from '@/actions/types';

interface UseHistoryReturn {
  operations: Operation[];
  isLoading: boolean;
  error: string | null;
  filterType: HistoryFilterType;
  setFilterType: (type: HistoryFilterType) => void;
  refresh: () => void;
}

export function useHistory(): UseHistoryReturn {
  const { getPortfolioHistory } = usePortfolioActions();

  const [raw, setRaw] = useState<Operation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<HistoryFilterType>('ALL');

  const refresh = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getPortfolioHistory()
      .then(setRaw)
      .catch(() =>
        setError('No se pudo cargar el historial. Intentá de nuevo.')
      )
      .finally(() => setIsLoading(false));
  }, [getPortfolioHistory]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const operations = useMemo(
    () => raw.filter((op) => filterType === 'ALL' || op.type === filterType),
    [raw, filterType]
  );

  return {
    operations,
    isLoading,
    error,
    filterType,
    setFilterType,
    refresh,
  };
}
