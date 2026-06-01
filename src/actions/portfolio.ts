import { useClient } from './_client';
import { useAuth } from '@/hooks/useAuth';
import type {
  CreateOperationPayload,
  Operation,
  PatchOperationPayload,
  PortfolioProfitLoss,
  PortfolioValue,
  Position,
} from './types';

export function usePortfolioActions() {
  const apiRequest = useClient();
  const { user } = useAuth();

  return {
    getPortfolio: async (): Promise<Position[]> => {
      if (!user?.id) return Promise.reject(new Error('Not authenticated'));
      const result = await apiRequest<unknown>('/api/portfolio');
      console.log('[getPortfolio] raw response:', JSON.stringify(result));
      if (Array.isArray(result)) return result as Position[];
      if (result && typeof result === 'object' && 'positions' in result)
        return (result as { positions: Position[] }).positions;
      return [];
    },

    createOperation: (payload: CreateOperationPayload): Promise<Operation> =>
      apiRequest('/api/portfolio/operations', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    getPortfolioHistory: (): Promise<Operation[]> =>
      apiRequest('/api/portfolio/history'),

    patchOperation: (
      id: number,
      payload: PatchOperationPayload
    ): Promise<Operation> =>
      apiRequest(`/api/portfolio/history/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),

    deleteOperation: (id: number): Promise<void> =>
      apiRequest(`/api/portfolio/history/${id}`, { method: 'DELETE' }),

    getPortfolioValue: (): Promise<PortfolioValue> =>
      apiRequest('/api/portfolio/value'),

    getPortfolioProfitLoss: (): Promise<PortfolioProfitLoss> =>
      apiRequest('/api/portfolio/profit-loss'),
  };
}
