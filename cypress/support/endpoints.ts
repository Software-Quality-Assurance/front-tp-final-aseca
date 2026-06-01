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
};
