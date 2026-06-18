import { endpoints } from '../support/endpoints';

describe('Portfolio — Feature 5', () => {
  const uniqueId = Date.now();
  const email = `portfolio_test_${uniqueId}@example.com`;
  const password = 'Password123!';
  const testTicker = `PF${String(uniqueId).slice(-6)}`;
  const testQuantity = '5';

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

    cy.getAuthToken(email, password).then((token) => {
      cy.request({
        method: 'POST',
        url: endpoints.company.base(),
        body: {
          ticker: testTicker,
          companyName: 'Portfolio Cypress Corp',
          price: 31.4,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        failOnStatusCode: false,
      }).then((res) => {
        expect(res.status).to.be.oneOf([201, 409]);
      });
    });
  });

  beforeEach(() => {
    cy.login(email, password, '/');
    cy.get('[data-testid="portfolio-add-button"]', { timeout: 10000 }).should(
      'be.visible'
    );
  });

  // helpers
  function buyPosition(ticker: string, quantity: string) {
    cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-buy-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').clear({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(ticker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').clear({
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type(quantity, {
      force: true,
    });
    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.wait('@buyOp');
    cy.get('[data-testid="add-position-modal"]', { timeout: 5000 }).should(
      'not.exist'
    );
  }

  function sellPosition(ticker: string, quantity: string) {
    cy.intercept('POST', endpoints.portfolio.operations()).as('sellOp');
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-sell-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').clear({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(ticker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').clear({
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type(quantity, {
      force: true,
    });
    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.wait('@sellOp');
  }

  // ─── 5.1: Visualización del portfolio ───────────────────────────────────────

  it('5.1 — muestra la pantalla de portfolio al autenticarse', () => {
    cy.contains('Portfolio', { timeout: 10000 }).should('be.visible');
  });

  it('5.1 — portfolio vacío muestra estado vacío', () => {
    cy.get('[data-testid="portfolio-empty-state"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('No positions yet').should('be.visible');
  });

  it('5.1 — usuario no autenticado es redirigido al login', () => {
    cy.clearLocalStorage();
    cy.visit('/');
    cy.url().should('include', '/login');
  });

  it('5.1 — portfolio muestra compañía, ticker, cantidad y precio', () => {
    buyPosition(testTicker, testQuantity);
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).within(() => {
      cy.contains(testTicker).should('be.visible');
      cy.contains('Qty').should('be.visible');
      cy.contains('Price').should('be.visible');
      cy.contains('Value').should('be.visible');
    });
  });

  // ─── 5.2: Gestión de posiciones — BUY ───────────────────────────────────────

  it('5.2 — botón Add abre el modal', () => {
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-modal"]', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('5.2 — modal tiene toggle BUY/SELL', () => {
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-buy-button"]').should('be.visible');
    cy.get('[data-testid="add-position-sell-button"]').should('be.visible');
  });

  it('5.2 — BUY agrega posición y aparece en el portfolio', () => {
    buyPosition(testTicker, testQuantity);
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');
  });

  it('5.2 — BUY acumula cantidad en posición existente', () => {
    buyPosition(testTicker, '3');
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');
    buyPosition(testTicker, '2');
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');
  });

  it('5.2 — BUY se registra con timestamp del servidor y retorna 201', () => {
    cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-buy-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').clear({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').clear({
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type('1', {
      force: true,
    });

    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.wait('@buyOp').then((interception) => {
      expect(interception.response?.statusCode).to.eq(201);
      const body = interception.response?.body as { timestamp?: string };
      expect(body.timestamp).to.be.a('string');
      expect(body.timestamp).not.to.equal('');
    });
    cy.get('[data-testid="add-position-modal"]', { timeout: 5000 }).should(
      'not.exist'
    );
  });

  it('5.2 — BUY con ticker inválido muestra error', () => {
    cy.intercept('POST', endpoints.portfolio.operations()).as('createOp');
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(
      'INVALIDTICKER999',
      { force: true }
    );
    cy.get('[data-testid="add-position-quantity-input"]').type('1', {
      force: true,
    });
    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.wait('@createOp');
    cy.get('[data-testid="add-position-error"]', { timeout: 5000 }).should(
      'be.visible'
    );
    cy.get('[data-testid="add-position-modal"]').should('be.visible');
  });

  it('5.2 — BUY con cantidad 0 muestra error de validación', () => {
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type('0', {
      force: true,
    });
    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.contains('Quantity must be a whole number', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('5.2 — BUY con cantidad decimal muestra error de validación', () => {
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type('2.5', {
      force: true,
    });
    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.contains('Quantity must be a whole number', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('5.2 — cancelar BUY no modifica el portfolio', () => {
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type('10', {
      force: true,
    });
    cy.contains('Cancel').click({ force: true });
    cy.get('[data-testid="add-position-modal"]').should('not.exist');
  });

  // ─── 5.2: Gestión de posiciones — SELL ──────────────────────────────────────

  it('5.2 — SELL parcial reduce la posición sin eliminarla', () => {
    buyPosition(testTicker, '10');
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');

    sellPosition(testTicker, '3');
    cy.get('[data-testid="add-position-modal"]', { timeout: 5000 }).should(
      'not.exist'
    );
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');
  });

  it('5.2 — SELL por cantidad exacta comprada retorna 201', () => {
    buyPosition(testTicker, '5');
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');

    cy.intercept('POST', endpoints.portfolio.operations()).as('sellExact');
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-sell-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').clear({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').clear({
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type('5', {
      force: true,
    });
    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.wait('@sellExact').its('response.statusCode').should('eq', 201);
    cy.get('[data-testid="add-position-modal"]', { timeout: 5000 }).should(
      'not.exist'
    );
  });

  it('5.2 — SELL de más acciones de las disponibles muestra error', () => {
    buyPosition(testTicker, '2');
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');

    cy.intercept('POST', endpoints.portfolio.operations()).as('oversell');
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-sell-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').clear({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').clear({
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type('99999', {
      force: true,
    });
    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.wait('@oversell');
    cy.get('[data-testid="add-position-error"]', { timeout: 5000 }).should(
      'be.visible'
    );
    cy.get('[data-testid="add-position-modal"]').should('be.visible');
  });

  it('5.2 — SELL con cantidad 0 muestra error de validación', () => {
    cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
    cy.get('[data-testid="add-position-sell-button"]').click({ force: true });
    cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
      force: true,
    });
    cy.get('[data-testid="add-position-quantity-input"]').type('0', {
      force: true,
    });
    cy.get('[data-testid="add-position-submit-button"]').click({ force: true });
    cy.contains('Quantity must be a whole number', { timeout: 5000 }).should(
      'be.visible'
    );
  });

  it('5.2 — SELL elimina posición desde botón Delete del portfolio', () => {
    buyPosition(testTicker, testQuantity);
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');

    cy.intercept('POST', endpoints.portfolio.operations()).as('deleteOp');
    cy.get(`[data-testid="delete-position-button-${testTicker}"]`).click({
      force: true,
    });
    cy.get('[data-testid="delete-position-confirm-button"]', {
      timeout: 5000,
    }).click({ force: true });
    cy.wait('@deleteOp');

    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('not.exist');
  });

  it('5.2 — cancelar Delete no modifica el portfolio', () => {
    buyPosition(testTicker, testQuantity);
    cy.get(`[data-testid="position-item-${testTicker}"]`, {
      timeout: 10000,
    }).should('be.visible');

    cy.get(`[data-testid="delete-position-button-${testTicker}"]`).click({
      force: true,
    });
    cy.get('[data-testid="delete-position-cancel-button"]').click({
      force: true,
    });
    cy.get(`[data-testid="position-item-${testTicker}"]`).should('be.visible');
  });

  // ─── 5.3: Navegación desde portfolio ────────────────────────────────────────

  it('5.3 — navega a Current Value desde el botón en portfolio', () => {
    cy.contains('View Current Value').click({ force: true });
    cy.url().should('include', '/current-value');
    cy.contains('Current Value').should('be.visible');
  });

  it('5.3 — navega a Watchlist desde la barra lateral', () => {
    cy.contains('Watchlist').click({ force: true });
    cy.url().should('include', '/watchlist');
    cy.get('[data-testid="watchlist-screen"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('Watchlist').should('be.visible');
  });

  it('5.3 — mantiene sesión al navegar entre secciones', () => {
    cy.contains('History').click({ force: true });
    cy.url().should('include', '/history');
    cy.contains('Portfolio').click({ force: true });
    cy.url().should('include', '/');
    cy.contains('Portfolio').should('be.visible');
  });

  it('5.3 — portfolio vacío navega a secciones sin errores', () => {
    cy.contains('Watchlist').click({ force: true });
    cy.url().should('include', '/watchlist');
    cy.get('[data-testid="watchlist-screen"]', { timeout: 10000 }).should(
      'be.visible'
    );
  });
});
