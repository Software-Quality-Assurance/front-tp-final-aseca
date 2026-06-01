import { useClient } from '@/actions/_client';

export interface WatchlistItem {
  id: number;
  ticker: string;
  companyName: string;
  currentPrice: number | null;
  lastUpdatedAt: string | null;
}

export interface WatchlistResponse {
  items: WatchlistItem[];
}

export function useWatchlistApi() {
  const apiRequest = useClient();

  return {
    getWatchlist: (): Promise<WatchlistResponse> =>
      apiRequest('/api/watchlist'),

    addToWatchlist: (ticker: string): Promise<void> =>
      apiRequest(`/api/watchlist/${ticker}`, {
        method: 'POST',
      }),

    removeFromWatchlist: (ticker: string): Promise<void> =>
      apiRequest(`/api/watchlist/${ticker}`, {
        method: 'DELETE',
      }),
  };
}

