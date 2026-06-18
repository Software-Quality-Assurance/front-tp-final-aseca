import { endpoints } from '../support/endpoints';

describe('Current Value — Feature 5', () => {
  const uniqueId = Date.now();
  const email = `current_value_test_${uniqueId}@example.com`;
  const password = 'Password123!';

  const currentValueResponse = {
    totalValue: 125430,
    lastUpdatedAt: '2026-06-16T10:00:00.000Z',
    warnings: [],
    positions: [
      {
        ticker: 'AAPL',
        companyName: 'Apple Inc.',
        quantity: 10,
        currentPrice: 3500,
        currentValue: 35000,
        lastUpdatedAt: '2026-06-16T10:00:00.000Z',
        priceSource: null,
        warning: null,
      },
      {
        ticker: 'TSLA',
        companyName: 'Tesla, Inc.',
        quantity: 5,
        currentPrice: 3700,
        currentValue: 18500,
        lastUpdatedAt: '2026-06-16T10:00:00.000Z',
        priceSource: null,
        warning: null,
      },
    ],
  };

  const profitLossResponse = {
    totalProfitLoss: 8430,
    totalReturnPercentage: 7.2,
    totalInvestedCost: 0,
    totalCurrentValue: 0,
    warnings: [],
    positions: [
      {
        ticker: 'AAPL',
        company: 'Apple Inc.',
        quantity: 10,
        averageCost: 3270,
        currentPrice: 3500,
        investedCost: null,
        currentValue: null,
        priceSource: null,
        profitLoss: 2300,
        returnPercentage: 6.97,
        warning: null,
      },
      {
        ticker: 'TSLA',
        company: 'Tesla, Inc.',
        quantity: 5,
        averageCost: 3800,
        currentPrice: 3700,
        investedCost: null,
        currentValue: null,
        priceSource: null,
        profitLoss: -500,
        returnPercentage: -2.63,
        warning: null,
      },
    ],
  };

  before(() => {
    cy.request({
      method: 'POST',
      url: endpoints.auth.register(),
      body: { email, password },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([201, 409]);
    });
  });

  function visitCurrentValue() {
    cy.login(email, password, '/current-value');
    cy.get('[data-testid="current-value-screen"]', { timeout: 10000 }).should(
      'be.visible'
    );
  }

  function stubCurrentValueSuccess() {
    cy.intercept('GET', endpoints.portfolio.value(), currentValueResponse).as(
      'getCurrentValue'
    );
    cy.intercept(
      'GET',
      endpoints.portfolio.profitLoss(),
      profitLossResponse
    ).as('getCurrentValueProfitLoss');
  }

  function stubCurrentValueEmpty() {
    cy.intercept('GET', endpoints.portfolio.value(), {
      totalValue: 0,
      lastUpdatedAt: '2026-06-16T10:00:00.000Z',
      warnings: [],
      positions: [],
    }).as('getCurrentValue');
    cy.intercept('GET', endpoints.portfolio.profitLoss(), {
      totalProfitLoss: 0,
      totalReturnPercentage: 0,
      totalInvestedCost: 0,
      totalCurrentValue: 0,
      warnings: [],
      positions: [],
    }).as('getCurrentValueProfitLoss');
  }

  it('5.4 — muestra loading mientras carga el valor actual', () => {
    cy.intercept('GET', endpoints.portfolio.value(), (req) => {
      req.on('response', (res) => {
        res.delay = 500;
      });
    }).as('getCurrentValue');
    cy.intercept('GET', endpoints.portfolio.profitLoss(), (req) => {
      req.on('response', (res) => {
        res.delay = 500;
      });
    }).as('getCurrentValueProfitLoss');

    visitCurrentValue();

    cy.get('[data-testid="current-value-loading"]', { timeout: 5000 }).should(
      'be.visible'
    );
    cy.contains('Loading current value...').should('be.visible');
  });

  it('5.4 — muestra el resumen y las posiciones con datos reales', () => {
    stubCurrentValueSuccess();
    visitCurrentValue();

    cy.wait('@getCurrentValue');
    cy.wait('@getCurrentValueProfitLoss');

    cy.get('[data-testid="current-value-summary"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('Portfolio Value').should('be.visible');
    cy.contains('$125430.00').should('be.visible');
    cy.contains('+$8430.00').should('be.visible');

    cy.get('[data-testid="current-value-position-AAPL"]')
      .should('be.visible')
      .within(() => {
        cy.contains('AAPL').should('be.visible');
        cy.contains('$35000.00').should('be.visible');
        cy.contains('+$2300.00').should('be.visible');
      });

    cy.get('[data-testid="current-value-position-TSLA"]')
      .should('be.visible')
      .within(() => {
        cy.contains('TSLA').should('be.visible');
        cy.contains('$18500.00').should('be.visible');
        cy.contains('-$500.00').should('be.visible');
      });
  });

  it('5.4 — muestra estado vacío cuando no hay posiciones', () => {
    stubCurrentValueEmpty();
    visitCurrentValue();

    cy.wait('@getCurrentValue');
    cy.wait('@getCurrentValueProfitLoss');

    cy.get('[data-testid="current-value-empty-state"]', {
      timeout: 10000,
    }).should('be.visible');
    cy.contains('No positions yet').should('be.visible');
    cy.contains('Buy stocks to see your current value breakdown.').should(
      'be.visible'
    );
  });

  it('5.4 — muestra error cuando falla la carga del valor actual', () => {
    cy.intercept('GET', endpoints.portfolio.value(), {
      statusCode: 500,
      body: { message: 'error' },
    }).as('getCurrentValue');
    cy.intercept(
      'GET',
      endpoints.portfolio.profitLoss(),
      profitLossResponse
    ).as('getCurrentValueProfitLoss');

    visitCurrentValue();

    cy.wait('@getCurrentValue');
    cy.get('[data-testid="current-value-error"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains(
      'No se pudo cargar el valor actual del portfolio. Intentá de nuevo.'
    ).should('be.visible');
  });

  it('5.4 — permite navegar desde portfolio a current value', () => {
    stubCurrentValueSuccess();
    cy.login(email, password, '/');
    cy.contains('View Current Value').click({ force: true });

    cy.url().should('include', '/current-value');
    cy.contains('Current Value').should('be.visible');
    cy.get('[data-testid="current-value-summary"]', { timeout: 10000 }).should(
      'be.visible'
    );
  });
});
