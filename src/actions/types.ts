// --- Company ---

export type Company = {
  id: number
  ticker: string
  companyName: string
}

export type CompanyPage = {
  content: Company[]
  totalPages: number
  totalElements: number
  number: number
}

export type CreateCompanyPayload = {
  ticker: string
  companyName: string
}

export type CompanySearchParams =
  | { name: string; ticker?: never }
  | { ticker: string; name?: never }

// --- Portfolio ---

export type Position = {
  ticker: string
  companyName: string
  quantity: number
  currentPrice: number
  currentValue: number
  lastUpdatedAt: string
  warning: string | null
}

export type OperationType = 'BUY' | 'SELL'

export type Operation = {
  id: number
  ticker: string
  company: string
  type: OperationType
  quantity: number
  unitPrice: number
  totalPrice: number
  date: string
}

export type CreateOperationPayload = {
  ticker: string
  type: OperationType
  quantity: number
}

export type PatchOperationPayload = {
  type?: OperationType
  quantity?: number
}

export type PositionValue = {
  ticker: string
  company: string
  quantity: number
  currentPrice: number
  currentValue: number
  priceUpdatedAt: string
}

export type PortfolioValue = {
  totalValue: number
  lastUpdatedAt: string
  positions: PositionValue[]
}

export type PositionProfitLoss = {
  ticker: string
  company: string
  quantity: number
  averageCost: number
  currentPrice: number
  profitLoss: number
  profitLossPercentage: number
}

export type PortfolioProfitLoss = {
  totalProfitLoss: number
  totalProfitLossPercentage: number
  positions: PositionProfitLoss[]
}
