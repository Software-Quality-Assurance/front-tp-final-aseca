import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePortfolioActions } from '@/actions/portfolio';
import type {
  PortfolioProfitLoss,
  PortfolioValue,
  PositionProfitLoss,
  PositionValue,
} from '@/actions/types';

export type CurrentValuePosition = PositionValue & PositionProfitLoss;

export type CurrentValueSummary = {
  totalValue: number;
  totalProfitLoss: number;
  totalProfitLossPercentage: number;
  lastUpdatedAt: string;
};

type UseCurrentValueReturn = {
  summary: CurrentValueSummary | null;
  positions: CurrentValuePosition[];
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
};

function mergePositions(
  valuePositions: PortfolioValue['positions'],
  profitLossPositions: PortfolioProfitLoss['positions']
): CurrentValuePosition[] {
  const profitLossByTicker = new Map(
    profitLossPositions.map((position) => [position.ticker, position])
  );

  return valuePositions.map((position) => {
    const profitLoss = profitLossByTicker.get(position.ticker);

    return {
      ...position,
      averageCost: profitLoss?.averageCost ?? 0,
      profitLoss: profitLoss?.profitLoss ?? 0,
      profitLossPercentage: profitLoss?.profitLossPercentage ?? 0,
    };
  });
}

export function useCurrentValue(): UseCurrentValueReturn {
  const { getPortfolioValue, getPortfolioProfitLoss } = usePortfolioActions();

  const [value, setValue] = useState<PortfolioValue | null>(null);
  const [profitLoss, setProfitLoss] = useState<PortfolioProfitLoss | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [nextValue, nextProfitLoss] = await Promise.all([
        getPortfolioValue(),
        getPortfolioProfitLoss(),
      ]);

      setValue(nextValue);
      setProfitLoss(nextProfitLoss);
    } catch {
      setError('No se pudo cargar el valor actual del portfolio. Intentá de nuevo.');
      setValue(null);
      setProfitLoss(null);
    } finally {
      setIsLoading(false);
    }
  }, [getPortfolioProfitLoss, getPortfolioValue]);

  useEffect(() => {
    load();
  }, [load]);

  const positions = useMemo(() => {
    if (!value || !profitLoss) return [];
    return mergePositions(value.positions, profitLoss.positions);
  }, [value, profitLoss]);

  const summary = useMemo<CurrentValueSummary | null>(() => {
    if (!value || !profitLoss) return null;

    return {
      totalValue: value.totalValue,
      totalProfitLoss: profitLoss.totalProfitLoss,
      totalProfitLossPercentage: profitLoss.totalProfitLossPercentage,
      lastUpdatedAt: value.lastUpdatedAt,
    };
  }, [value, profitLoss]);

  return {
    summary,
    positions,
    isLoading,
    error,
    refresh: load,
  };
}