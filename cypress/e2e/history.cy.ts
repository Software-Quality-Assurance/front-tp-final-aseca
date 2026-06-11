import {
  buyPosition,
  sellPosition,
} from '../support/helpers/portfolio.helpers';
import { endpoints } from '../support/endpoints';
import { goToHistory } from '../support/helpers/navigation.actions';

describe('History - Reglas de negocio', () => {
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

    // Company creation
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
    cy.waitForScreen('portfolio-screen');
    goToHistory();
  });

  // ─── Visualización con datos reales ─────────────────────────────────────

  describe('Visualización', () => {
    it('historial vacío muestra estado vacío', () => {
      cy.get('[data-testid="history-empty-state"]', { timeout: 10000 }).should(
        'be.visible'
      );
      cy.contains('No transactions yet').should('be.visible');
    });

    it('un BUY registrado aparece en el historial con ticker, tipo y cantidad correctos', () => {
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

    it('un SELL registrado aparece en el historial con ticker, tipo y cantidad correctos', () => {
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

    it('múltiples operaciones aparecen ordenadas por fecha descendente', () => {
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
  });

  // ─── Persistencia e integridad ──────────────────────────────────────────

  describe('Persistencia e integridad', () => {
    it('GET /history retorna 200 con un array de operaciones con estructura válida', () => {
      buyPosition(testTicker, 3);
      cy.contains('History').click({ force: true });

      cy.intercept('GET', endpoints.portfolio.history()).as('getHistory');
      cy.reload();
      cy.wait('@getHistory').then((interception) => {
        expect(interception.response?.statusCode).to.eq(200);

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
        expect(new Date(first.timestamp).toString()).not.to.eq('Invalid Date');
      });
    });

    it('BUY registra el precio vigente de la compañía', () => {
      cy.intercept('POST', endpoints.portfolio.operations()).as('buyOperation');

      buyPosition(testTicker, 2);

      cy.wait('@buyOperation').then(({ response }) => {
        expect(response?.statusCode).to.eq(201);

        const operation = response?.body;

        expect(operation.type).to.eq('BUY');
        expect(operation.unitPrice).to.eq(50);
      });
    });

    it('SELL registra el precio vigente de la compañía', () => {
      buyPosition(testTicker, 5);

      cy.intercept('POST', endpoints.portfolio.operations()).as(
        'sellOperation'
      );

      sellPosition(testTicker, 2);

      cy.wait('@sellOperation').then(({ response }) => {
        expect(response?.statusCode).to.eq(201);

        const operation = response?.body;

        expect(operation.type).to.eq('SELL');
        expect(operation.unitPrice).to.eq(50);
      });
    });
  });

  // ─── Consistencia Portfolio ↔ History ───────────────────────────────────

  describe('Consistencia Portfolio <-> History', () => {
    it('BUY actualiza la cantidad en portfolio', () => {
      buyPosition(testTicker, 5);

      cy.contains('Portfolio').click({ force: true });

      cy.get(`[data-testid="position-item-${testTicker}"]`).should(
        'contain',
        '5'
      );
    });

    it('SELL parcial reduce la cantidad en portfolio', () => {
      buyPosition(testTicker, 10);
      sellPosition(testTicker, 4);

      cy.contains('Portfolio').click({ force: true });

      cy.get(`[data-testid="position-item-${testTicker}"]`).should(
        'contain',
        '6'
      );
    });

    it('SELL total elimina la posición del portfolio', () => {
      buyPosition(testTicker, 5);
      sellPosition(testTicker, 5);

      cy.contains('Portfolio').click({ force: true });

      cy.get(`[data-testid="position-item-${testTicker}"]`).should('not.exist');
    });

    it('una compra impacta simultáneamente portfolio e history', () => {
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

    it('el balance refleja la compra realizada', () => {
      buyPosition(testTicker, 2);

      cy.contains('View Current Value').click({ force: true });

      cy.contains('$100.00').should('be.visible');
    });
  });
});
