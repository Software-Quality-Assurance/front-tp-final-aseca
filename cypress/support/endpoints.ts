const api = () => Cypress.env('apiUrl') as string;

export const endpoints = {
  auth: {
    register: () => `${api()}/api/auth/register`,
    login: () => `${api()}/api/auth/login`,
  },
  portfolio: {
    positions: () => `${api()}/api/portfolio`,
    operations: () => `${api()}/api/portfolio/operations`,
    history: () => `${api()}/api/portfolio/history`,
    value: () => `${api()}/api/portfolio/value`,
    profitLoss: () => `${api()}/api/portfolio/profit-loss`,
  },
  company: {
    base: () => `${api()}/api/company`,
    search: () => `${api()}/api/company/search`,
  },
  watchlist: {
    base: () => `${api()}/api/watchlist`,
    ticker: (ticker: string) => `${api()}/api/watchlist/${ticker}`,
  },
  edgar: {
    search: () => `${api()}/api/edgar/search`,
    metrics: (ticker: string) => `${api()}/api/edgar/companies/${ticker}/metrics`,
    filings: (ticker: string) => `${api()}/api/edgar/companies/${ticker}/filings`,
    history: (ticker: string) => `${api()}/api/edgar/companies/${ticker}/history`,
    comparison: () => `${api()}/api/edgar/comparison`,
  },
};
