// --- Company ---

export type Company = {
  id: number;
  ticker: string;
  companyName: string;
};

export type CompanyPage = {
  content: Company[];
  totalPages: number;
  totalElements: number;
  number: number;
};

export type CreateCompanyPayload = {
  ticker: string;
  companyName: string;
};

export type CompanySearchParams =
  | { name: string; ticker?: never }
  | { ticker: string; name?: never };

// --- Portfolio ---

export type Position = {
  ticker: string;
  companyName: string;
  quantity: number;
  currentPrice: number;
  currentValue: number;
  lastUpdatedAt: string;
  warning: string | null;
};

export type OperationType = 'BUY' | 'SELL';

export type Operation = {
  id: number;
  ticker: string;
  companyName: string;
  type: OperationType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  timestamp: string;
};

export type CreateOperationPayload = {
  ticker: string;
  type: OperationType;
  quantity: number;
};

export type PatchOperationPayload = {
  type?: OperationType;
  quantity?: number;
};

export type PositionValue = {
  ticker: string;
  companyName: string;
  quantity: number;
  currentPrice: number | null;
  currentValue: number | null;
  lastUpdatedAt: string | null;
  priceSource: string | null;
  warning: string | null;
};

export type PortfolioValue = {
  totalValue: number;
  lastUpdatedAt: string | null;
  positions: PositionValue[];
  warnings: string[];
};

export type PositionProfitLoss = {
  ticker: string;
  companyName: string;
  quantity: number;
  averageCost: number | null;
  currentPrice: number | null;
  priceSource: string | null;
  investedCost: number | null;
  currentValue: number | null;
  profitLoss: number | null;
  returnPercentage: number | null;
  warning: string | null;
};

export type PortfolioProfitLoss = {
  totalInvestedCost: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  totalReturnPercentage: number;
  positions: PositionProfitLoss[];
  warnings: string[];
};
