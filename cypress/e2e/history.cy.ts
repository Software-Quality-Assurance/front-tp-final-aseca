import { buyPosition, sellPosition } from '../support/helpers/portfolio.helpers';
import { endpoints } from '../support/endpoints';

describe('History – Feature 4', () => {
  const uniqueId = Date.now();
  const email = `history_test_${uniqueId}@example.com`;
  const password = 'Password123!';
  const testTicker = `HI${String(uniqueId).slice(-6)}`;

  before(() => {
    // User registration
    cy.request({
      method: 'POST',
      url: endpoints.auth.register(),
      body: { email, password },
      headers: { 'Content-Type': 'application/json' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.be.oneOf([201, 409]);
    });

    // Company Creation
    cy.getAuthToken(email, password).then((token) => {
      cy.request({
        method: 'POST',
        url: endpoints.company.base(),
        body: {
          ticker: testTicker,
          companyName: 'History Cypress Corp',
          price: 50.0,
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
    cy.contains('History').click({ force: true });
    cy.url().should('include', '/history');
    cy.waitForScreen('history-screen');
  });

  // ─── 6.1: Visualización del historial ────────────────────────────────────────

  it('6.1 – muestra la pantalla de History al navegar desde sidebar', () => {
    cy.get('[data-testid="history-screen"]').should('be.visible');
    cy.contains('History').should('be.visible');
  });

  it('6.1 – historial vacío muestra estado vacío', () => {
    cy.get('[data-testid="history-empty-state"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.contains('No transactions yet').should('be.visible');
  });

  it('6.1 – usuario no autenticado es redirigido al login', () => {
    cy.clearLocalStorage();
    cy.visit('/history');
    cy.url().should('include', '/login');
  });

  it('6.1 – un BUY registrado aparece en el historial', () => {
    buyPosition(testTicker, 3);
    cy.contains('History').click({ force: true });

    cy.get('[data-testid="history-list"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.get(`[data-testid="history-item-${testTicker}"]`)
      .first()
      .within(() => {
        cy.contains(testTicker).should('be.visible');
        cy.contains('BUY').should('be.visible');
        cy.contains('3').should('be.visible');
      });
  });

  it('6.1 – un SELL registrado aparece en el historial', () => {
    buyPosition(testTicker, 5);
    sellPosition(testTicker, 2);
    cy.contains('History').click({ force: true });

    cy.get('[data-testid="history-list"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.get(`[data-testid="history-item-${testTicker}"]`)
      .first()
      .within(() => {
        cy.contains(testTicker).should('be.visible');
        cy.contains('SELL').should('be.visible');
        cy.contains('2').should('be.visible');
      });
  });

  it('6.1 – cada item muestra ticker, tipo, cantidad, precio y timestamp', () => {
    buyPosition(testTicker, 4);
    cy.contains('History').click({ force: true });

    cy.get(`[data-testid="history-item-${testTicker}"]`)
      .first()
      .within(() => {
        cy.get('[data-testid="history-item-type"]').should('be.visible');
        cy.get('[data-testid="history-item-quantity"]').should('be.visible');
        cy.get('[data-testid="history-item-price"]').should('be.visible');
        cy.get('[data-testid="history-item-timestamp"]').should('be.visible');
      });
  });

  it('6.1 – múltiples operaciones aparecen ordenadas por fecha descendente', () => {
    buyPosition(testTicker, 1);
    buyPosition(testTicker, 2);
    cy.contains('History').click({ force: true });

    cy.get('[data-testid="history-list"]', { timeout: 10000 }).should(
      'be.visible'
    );
    cy.get('[data-testid^="history-item-"]').should(
      'have.length.greaterThan',
      1
    );
    cy.get('[data-testid="history-item-timestamp"]').then(($timestamps) => {
      const first = new Date($timestamps.eq(0).text()).getTime();
      const second = new Date($timestamps.eq(1).text()).getTime();
      expect(first).to.be.gte(second);
    });
  });

  // ─── 6.2: Endpoint GET /history retorna datos correctos ──────────────────────

  it('6.2 – GET /history retorna 200 con array de operaciones', () => {
    cy.intercept('GET', endpoints.portfolio.history()).as('getHistory');
    cy.reload();
    cy.wait('@getHistory').then((interception) => {
      expect(interception.response?.statusCode).to.eq(200);
      expect(interception.response?.body).to.be.an('array');
    });
  });

  it('6.2 – cada operación del historial tiene los campos requeridos', () => {
    buyPosition(testTicker, 3);
    cy.contains('History').click({ force: true });

    cy.intercept('GET', endpoints.portfolio.history()).as('getHistory');
    cy.reload();
    cy.wait('@getHistory').then((interception) => {
      const operations = interception.response?.body as Array<{
        ticker: string;
        type: string;
        quantity: number;
        price: number;
        timestamp: string;
      }>;
      expect(operations).to.be.an('array').and.have.length.greaterThan(0);

      const first = operations[0];
      expect(first).to.have.property('ticker');
      expect(first).to.have.property('type');
      expect(first).to.have.property('quantity');
      expect(first).to.have.property('price');
      expect(first).to.have.property('timestamp');
    });
  });

  it('6.2 – el timestamp de cada operación es una fecha válida', () => {
    buyPosition(testTicker, 1);
    cy.contains('History').click({ force: true });

    cy.intercept('GET', endpoints.portfolio.history()).as('getHistory');
    cy.reload();
    cy.wait('@getHistory').then((interception) => {
      const operations = interception.response?.body as Array<{
        timestamp: string;
      }>;
      operations.forEach((op) => {
        expect(new Date(op.timestamp).toString()).not.to.eq('Invalid Date');
      });
    });
  });

  it('6.2 - BUY registra el precio vigente de la compañía', () => {
    cy.intercept('POST', endpoints.portfolio.operations()).as('buyOperation');

    buyPosition(testTicker, 2);

    cy.wait('@buyOperation').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);

      const operation = response?.body;

      expect(operation.type).to.eq('BUY');
      expect(operation.unitPrice).to.eq(50);
    });
  });

  it('6.2 - SELL registra el precio vigente de la compañía', () => {
    buyPosition(testTicker, 5);

    cy.intercept('POST', endpoints.portfolio.operations()).as('sellOperation');

    sellPosition(testTicker, 2);

    cy.wait('@sellOperation').then(({ response }) => {
      expect(response?.statusCode).to.eq(201);

      const operation = response?.body;

      expect(operation.type).to.eq('SELL');
      expect(operation.unitPrice).to.eq(50);
    });
  });

  it('6.2 - BUY crea una entrada en History', () => {
    buyPosition(testTicker, 3);

    cy.contains('History').click({ force: true });

    cy.get(`[data-testid="history-item-${testTicker}"]`)
      .should('exist')
      .within(() => {
        cy.contains('BUY');
        cy.contains('3');
      });
  });

  it('6.2 - SELL crea una entrada en History', () => {
    buyPosition(testTicker, 5);

    sellPosition(testTicker, 2);

    cy.contains('History').click({ force: true });

    cy.get(`[data-testid="history-item-${testTicker}"]`)
      .first()
      .within(() => {
        cy.contains('SELL');
        cy.contains('2');
      });
  });


  // ─── 6.3: Navegación desde History ───────────────────────────────────────────

  it('6.3 – navega de vuelta a Portfolio desde sidebar', () => {
    cy.contains('Portfolio').click({ force: true });
    cy.url().should('include', '/');
    cy.waitForScreen('portfolio-screen');
  });

  it('6.3 – navega a Watchlist desde sidebar sin perder sesión', () => {
    cy.contains('Watchlist').click({ force: true });
    cy.url().should('include', '/watchlist');
    cy.waitForScreen('watchlist-screen');
  });

  it('6.3 – navega a Current Value desde sidebar sin perder sesión', () => {
    cy.contains('View Current Value').click({ force: true });
    cy.url().should('include', '/current-value');
    cy.contains('Current Value').should('be.visible');
  });

  it('6.3 – regresar a History desde Portfolio mantiene la sesión activa', () => {
    cy.contains('Portfolio').click({ force: true });
    cy.contains('History').click({ force: true });
    cy.url().should('include', '/history');
    cy.waitForScreen('history-screen');
  });

  it('6.3 - BUY actualiza cantidad en portfolio', () => {
    buyPosition(testTicker, 5);

    cy.contains('Portfolio').click({ force: true });

    cy.get(`[data-testid="position-item-${testTicker}"]`).should(
      'contain',
      '5'
    );
  });

  it('6.3 - SELL parcial reduce la cantidad en portfolio', () => {
    buyPosition(testTicker, 10);

    sellPosition(testTicker, 4);

    cy.contains('Portfolio').click({ force: true });

    cy.get(`[data-testid="position-item-${testTicker}"]`).should(
      'contain',
      '6'
    );
  });

  it('6.3 - SELL total elimina la posición del portfolio', () => {
    buyPosition(testTicker, 5);

    sellPosition(testTicker, 5);

    cy.contains('Portfolio').click({ force: true });

    cy.get(`[data-testid="position-item-${testTicker}"]`).should('not.exist');
  });

  it('6.3 - una compra impacta simultáneamente portfolio e history', () => {
    buyPosition(testTicker, 4);

    cy.contains('Portfolio').click({ force: true });

    cy.get(`[data-testid="position-item-${testTicker}"]`).should('exist');

    cy.contains('History').click({ force: true });

    cy.get(`[data-testid="history-item-${testTicker}"]`)
      .should('exist')
      .within(() => {
        cy.contains('BUY');
        cy.contains('4');
      });
  });

  it('6.3 - una compra impacta simultáneamente portfolio e history', () => {
    buyPosition(testTicker, 4);

    cy.contains('Portfolio').click({ force: true });

    cy.get(`[data-testid="position-item-${testTicker}"]`)
      .should('exist');

    cy.contains('History').click({ force: true });

    cy.get(`[data-testid="history-item-${testTicker}"]`)
      .should('exist')
      .within(() => {
        cy.contains('BUY');
        cy.contains('4');
      });
  });

  it('6.3 - balance refleja la compra realizada', () => {
    buyPosition(testTicker, 2);

    cy.contains('View Current Value').click({ force: true });

    cy.contains('$100.00').should('be.visible');
  });

});