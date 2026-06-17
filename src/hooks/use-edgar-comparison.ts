import { useState, useCallback, useEffect } from 'react';
import { useEdgarApi, FinancialComparisonResponse } from '@/actions/edgar';

export function useEdgarComparison() {
  const [data, setData] = useState<FinancialComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useEdgarApi();

  const fetchComparison = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.comparison();
      setData(response);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch comparison');
    } finally {
      setLoading(false);
    }
  }, [api]);

  return {
    data,
    loading,
    error,
    fetchComparison,
  };
}
