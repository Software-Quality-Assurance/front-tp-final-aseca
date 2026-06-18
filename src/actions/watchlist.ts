import { useClient } from '@/actions/_client';
import { normalizeTicker } from '@/lib/ticker';

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
      apiRequest(`/api/watchlist/${normalizeTicker(ticker)}`, {
        method: 'POST',
      }),

    removeFromWatchlist: (ticker: string): Promise<void> =>
      apiRequest(`/api/watchlist/${normalizeTicker(ticker)}`, {
        method: 'DELETE',
      }),
  };
}
