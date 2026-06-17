export type TransactionType = 'BUY' | 'SELL';

export interface OperationResponse {
  id: number;
  ticker: string;
  companyName: string;
  type: TransactionType;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  timestamp: string; // ISO 8601
}

export type HistoryFilterType = 'ALL' | TransactionType;
