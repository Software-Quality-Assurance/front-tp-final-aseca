import { useCallback, useEffect, useMemo, useState } from 'react';
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
    refresh: load,
  };
}
