import { useState, useEffect, useCallback } from 'react';
import { useWatchlistApi, WatchlistItem } from '@/api/watchlist';

export function useWatchlist() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useWatchlistApi();

  const fetchWatchlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.getWatchlist();
      setItems(response.items);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch watchlist');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addTicker = async (ticker: string) => {
    try {
      await api.addToWatchlist(ticker);
      await fetchWatchlist();
    } catch (err: any) {
      throw err;
    }
  };

  const removeTicker = async (ticker: string) => {
    try {
      await api.removeFromWatchlist(ticker);
      await fetchWatchlist();
    } catch (err: any) {
      throw err;
    }
  };

  return {
    items,
    loading,
    error,
    refresh: fetchWatchlist,
    addTicker,
    removeTicker,
  };
}

