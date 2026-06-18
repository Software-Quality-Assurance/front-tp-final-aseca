import { useState, useCallback } from 'react';
import { useEdgarApi, EdgarCompanyResponse } from '@/actions/edgar';

export function useEdgarSearch() {
  const [results, setResults] = useState<EdgarCompanyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useEdgarApi();

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const response = await api.search(query);
        setResults(response);
      } catch (err: any) {
        setError(err.message || 'Failed to search companies');
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clear,
  };
}
