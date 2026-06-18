import { useState, useCallback } from 'react';
import {
  useEdgarApi,
  FinancialMetricsResponse,
  FilingsResponse,
  FinancialHistoryResponse,
  FinancialMetric,
} from '@/actions/edgar';

export function useEdgarCompany() {
  const [metrics, setMetrics] = useState<FinancialMetricsResponse | null>(null);
  const [filings, setFilings] = useState<FilingsResponse | null>(null);
  const [history, setHistory] = useState<
    Record<string, FinancialHistoryResponse>
  >({});

  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [loadingFilings, setLoadingFilings] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const api = useEdgarApi();

  const fetchMetrics = useCallback(
    async (ticker: string) => {
      setLoadingMetrics(true);
      setError(null);
      try {
        const data = await api.metrics(ticker);
        setMetrics(data);
      } catch (err: any) {
        setError(err.message || `Failed to fetch metrics for ${ticker}`);
      } finally {
        setLoadingMetrics(false);
      }
    },
    [api]
  );

  const fetchFilings = useCallback(
    async (ticker: string) => {
      setLoadingFilings(true);
      try {
        const data = await api.filings(ticker);
        setFilings(data);
      } catch (err: any) {
        // Just set error state. We don't overwrite the main error if it's there? Let's just track a general error for now.
        setError(err.message || `Failed to fetch filings for ${ticker}`);
      } finally {
        setLoadingFilings(false);
      }
    },
    [api]
  );

  const fetchHistory = useCallback(
    async (ticker: string, metric: FinancialMetric, quarters: number = 8) => {
      setLoadingHistory(true);
      try {
        const data = await api.history(ticker, metric, quarters);
        setHistory((prev) => ({ ...prev, [metric]: data }));
      } catch (err: any) {
        setError(err.message || `Failed to fetch history for ${ticker}`);
      } finally {
        setLoadingHistory(false);
      }
    },
    [api]
  );

  const clear = useCallback(() => {
    setMetrics(null);
    setFilings(null);
    setHistory({});
    setError(null);
  }, []);

  return {
    metrics,
    filings,
    history,
    loadingMetrics,
    loadingFilings,
    loadingHistory,
    error,
    fetchMetrics,
    fetchFilings,
    fetchHistory,
    clear,
  };
}
