import { endpoints } from '../support/endpoints';

describe('Watchlist — Feature 6', () => {
  const uniqueId = Date.now();
  const email = `watchlist_test_${uniqueId}@example.com`;
  const password = 'Password123!';
  const testTicker = 'AAPL';

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

  beforeEach(() => {
    cy.login(email, password, '/watchlist');
    cy.get('[data-testid="watchlist-screen"]', { timeout: 10000 }).should(
      'be.visible'
    );
  });

  function seedWatchlistItem(ticker: string) {
    cy.getAuthToken(email, password).then((token) => {
      cy.request({
        method: 'POST',
        url: endpoints.watchlist.ticker(ticker),
        headers: { Authorization: `Bearer ${token}` },
        failOnStatusCode: false,
      });
    });
  }

  it('6.1 — watchlist vacío muestra estado vacío', () => {
    cy.get('[data-testid="watchlist-empty-state"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('Your watchlist is empty').should('be.visible');
  });

  it('6.1 — agregar compañía a la watchlist', () => {
    cy.intercept('POST', endpoints.watchlist.ticker(testTicker)).as(
      'addToWatchlist'
    );

    cy.get('[data-testid="add-watchlist-button"]').click({ force: true });
    cy.get('[data-testid="add-watchlist-modal"]').should('be.visible');

    cy.get('[data-testid="add-watchlist-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-watchlist-submit-button"]').click({ force: true });

    cy.wait('@addToWatchlist').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
    });

    cy.get('[data-testid="add-watchlist-modal"]', { timeout: 10000 }).should(
      'not.exist'
    );
    cy.contains(testTicker, { timeout: 10000 }).should('be.visible');
  });

  it('6.1 — intentar agregar duplicado retorna error 409', () => {
    seedWatchlistItem(testTicker);
    cy.reload();
    cy.contains(testTicker, { timeout: 10000 }).should('be.visible');

    cy.get('[data-testid="add-watchlist-button"]').click({ force: true });
    cy.get('[data-testid="add-watchlist-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-watchlist-submit-button"]').click({ force: true });

    cy.get('[data-testid="add-watchlist-error"]').should(
      'contain',
      'already in watchlist'
    );
  });

  it('6.1 — intentar agregar ticker inexistente retorna error 404', () => {
    const invalidTicker = 'INVALID' + uniqueId;
    cy.get('[data-testid="add-watchlist-button"]').click({ force: true });
    cy.get('[data-testid="add-watchlist-ticker-input"]').type(invalidTicker, {
      force: true,
    });
    cy.get('[data-testid="add-watchlist-submit-button"]').click({ force: true });

    cy.get('[data-testid="add-watchlist-error"]').should('contain', 'not found');
  });

  it('6.1 — eliminar compañía de la watchlist', () => {
    seedWatchlistItem(testTicker);
    cy.reload();
    cy.contains(testTicker, { timeout: 10000 }).should('be.visible');

    cy.on('window:confirm', () => true);
    cy.contains('Remove').click({ force: true });

    cy.contains(testTicker).should('not.exist');
  });
});
