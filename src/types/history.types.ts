export type TransactionType = 'BUY' | 'SELL';

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

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
export type HistoryFilterStatus = 'ALL' | TransactionStatus;
