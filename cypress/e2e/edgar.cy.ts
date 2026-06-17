import { endpoints } from '../support/endpoints';

describe('EDGAR Integration — Features 6.2 to 6.5', () => {
  const uniqueId = Date.now();
  const email = `edgar_test_${uniqueId}@example.com`;
  const password = 'Password123!';
  const testTicker = 'AAPL';

  before(() => {
    cy.request({
      method: 'POST',
      url: endpoints.auth.register(),
      body: { email, password },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    });

    cy.getAuthToken(email, password).then((token) => {
      cy.request({
        method: 'POST',
        url: endpoints.company.base(),
        body: {
          ticker: testTicker,
          companyName: 'Apple Inc.',
          price: 150.0,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        failOnStatusCode: false,
      });
    });
  });

  beforeEach(() => {
    cy.login(email, password, '/explore');
    cy.get('[data-testid="explore-screen"]', { timeout: 10000 }).should('be.visible');
  });

  // US 6.3 - Búsqueda de empresas
  it('6.3 — buscar ticker devuelve resultado y permite seleccionarlo', () => {
    cy.get('[data-testid="company-search-input"]').type(testTicker);
    cy.get('[data-testid="company-search-button"]').click();

    cy.get('[data-testid="company-search-results"]').should('be.visible');
    cy.get(`[data-testid="search-result-${testTicker}"]`).should('be.visible').click();

    // Should open detail view
    cy.contains(`${testTicker} Analysis`).should('be.visible');
    cy.get('[data-testid="company-metrics-card"]').should('be.visible');
  });

  it('6.3 — buscar nombre sin resultados muestra empty state', () => {
    const invalidQuery = 'INVALIDCOMPANYNAME12345';
    cy.get('[data-testid="company-search-input"]').type(invalidQuery);
    cy.get('[data-testid="company-search-button"]').click();

    cy.get('[data-testid="search-empty-state"]').should('be.visible');
    cy.get('[data-testid="company-search-results"]').should('not.exist');
  });

  // US 6.4 - Consulta de información financiera
  it('6.4 — ver metricas, filings e historia', () => {
    // Navigate to detail view
    cy.get('[data-testid="company-search-input"]').type(testTicker);
    cy.get('[data-testid="company-search-button"]').click();
    cy.get(`[data-testid="search-result-${testTicker}"]`).click();

    // Check Metrics Card (US 6.4 criteria 1)
    cy.get('[data-testid="company-metrics-card"]').within(() => {
      cy.get('[data-testid="metric-row-revenue"]').should('be.visible');
      cy.get('[data-testid="metric-row-net-income"]').should('be.visible');
      cy.get('[data-testid="metric-row-eps"]').should('be.visible');
      cy.get('[data-testid="metric-row-total-assets"]').should('be.visible');
      cy.get('[data-testid="metric-row-total-liabilities"]').should('be.visible');
    });

    // Check History chart
    cy.get('[data-testid="company-history-card"]').scrollIntoView().should('be.visible');

    // Filings (US 6.4 criteria 5 & 6)
    cy.get('[data-testid="company-filings-card"]').scrollIntoView().should('be.visible');
    cy.contains('Recent Filings').should('be.visible');
  });

  it('6.5 — manejar ticker no encontrado (404)', () => {
    cy.intercept('GET', `**/api/edgar/companies/${testTicker}/metrics`, {
      statusCode: 404,
      body: 'Company with ticker AAPL not found'
    }).as('getMetricsError');

    cy.get('[data-testid="company-search-input"]').type(testTicker);
    cy.get('[data-testid="company-search-button"]').click();
    cy.get(`[data-testid="search-result-${testTicker}"]`).click();

    cy.wait('@getMetricsError');
    cy.contains('Company with ticker AAPL not found').should('be.visible');
  });

  // US 6.2 - Comparación
  it('6.2 — tabla de comparacion de métricas', () => {
    // First, let's put AAPL into the watchlist so it appears in the comparison.
    cy.getAuthToken(email, password).then((token) => {
      cy.request({
        method: 'POST',
        url: endpoints.watchlist.ticker(testTicker),
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    });

    // Visit Watchlist Screen
    cy.visit('/watchlist');
    cy.get('[data-testid="watchlist-screen"]', { timeout: 10000 }).should('be.visible');

    // Click compare
    cy.get('[data-testid="compare-button"]').click();
    cy.get('[data-testid="comparison-modal-content"]').should('be.visible');

    // Single company warning should be visible
    cy.get('[data-testid="comparison-warning"]').should('contain', 'At least two companies');

    // Table should render AAPL
    cy.get('[data-testid="comparison-table"]').should('be.visible');
    cy.contains(testTicker).should('be.visible');
    cy.contains('Revenue').should('be.visible');
  });
});
