import { useClient } from './_client';

export type FinancialMetric = 'REVENUE' | 'NET_INCOME' | 'EPS' | 'TOTAL_ASSETS' | 'TOTAL_LIABILITIES';

export interface EdgarCompanyResponse {
  cik: string;
  ticker: string;
  name: string;
}

export interface FinancialMetricValue {
  value: number | null;
  unit: string | null;
  reportDate: string | null;
  fiscalYear: number | null;
  fiscalPeriod: string | null;
  form: string | null;
}

export interface FinancialMetricsResponse {
  ticker: string;
  cik: string;
  revenue: FinancialMetricValue;
  netIncome: FinancialMetricValue;
  eps: FinancialMetricValue;
  totalAssets: FinancialMetricValue;
  totalLiabilities: FinancialMetricValue;
  partial: boolean;
}

export interface FilingResponse {
  form: string;
  filingDate: string;
  accessionNumber: string;
  documentUrl: string;
}

export interface FilingsResponse {
  ticker: string;
  cik: string;
  filings: FilingResponse[];
  message: string | null;
}

export interface FinancialHistoryPoint {
  period: string;
  fiscalYear: number | null;
  fiscalPeriod: string | null;
  reportDate: string;
  value: number;
  unit: string;
}

export interface FinancialHistoryResponse {
  ticker: string;
  cik: string;
  metric: FinancialMetric;
  points: FinancialHistoryPoint[];
  partial: boolean;
}

export interface CompanyComparisonResponse {
  ticker: string;
  companyName: string;
  inPortfolio: boolean;
  inWatchlist: boolean;
  metrics: FinancialMetricsResponse;
  bestMetrics: FinancialMetric[];
}

export interface FinancialComparisonResponse {
  companies: CompanyComparisonResponse[];
  warning: string | null;
}

export function useEdgarApi() {
  const apiRequest = useClient();

  return {
    search: (query: string): Promise<EdgarCompanyResponse[]> =>
      apiRequest(`/api/edgar/search?query=${encodeURIComponent(query)}`),

    metrics: (ticker: string): Promise<FinancialMetricsResponse> =>
      apiRequest(`/api/edgar/companies/${ticker}/metrics`),

    filings: (ticker: string): Promise<FilingsResponse> =>
      apiRequest(`/api/edgar/companies/${ticker}/filings`),

    history: (ticker: string, metric: FinancialMetric, quarters: number = 8): Promise<FinancialHistoryResponse> =>
      apiRequest(`/api/edgar/companies/${ticker}/history?metric=${metric}&quarters=${quarters}`),

    comparison: (): Promise<FinancialComparisonResponse> =>
      apiRequest(`/api/edgar/comparison`),
  };
}
