import { endpoints } from '../endpoints';

type OperationType = 'BUY' | 'SELL';

interface TradeOptions {
  ticker: string;
  quantity: number;
  type: OperationType;
}

function executeTrade({ ticker, quantity, type }: TradeOptions) {
  const alias = type === 'BUY' ? 'buyOperation' : 'sellOperation';

  cy.intercept('POST', endpoints.portfolio.operations()).as(alias);

  cy.get('[data-testid="portfolio-add-button"]').click({ force: true });

  cy.get(
    type === 'BUY'
      ? '[data-testid="add-position-buy-button"]'
      : '[data-testid="add-position-sell-button"]'
  ).click({ force: true });

  cy.get('[data-testid="add-position-ticker-input"]').clear({
    force: true,
  });

  cy.get('[data-testid="add-position-ticker-input"]').type(ticker, {
    force: true,
  });

  cy.get('[data-testid="add-position-quantity-input"]').clear({
    force: true,
  });

  cy.get('[data-testid="add-position-quantity-input"]').type(String(quantity), {
    force: true,
  });

  cy.get('[data-testid="add-position-submit-button"]').click({
    force: true,
  });

  cy.wait(`@${alias}`);

  cy.get('[data-testid="add-position-modal"]', {
    timeout: 5000,
  }).should('not.exist');
}

export function buyPosition(ticker: string, quantity: number) {
  executeTrade({
    ticker,
    quantity,
    type: 'BUY',
  });
}

export function sellPosition(ticker: string, quantity: number) {
  executeTrade({
    ticker,
    quantity,
    type: 'SELL',
  });
}
