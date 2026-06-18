import { endpoints } from '../support/endpoints';
import {
  buyPosition,
  sellPosition,
} from '../support/helpers/portfolio.helpers';

// Feature 4 — Operaciones e historial
//
// US 4.1, 4.2 y la mayoría de 4.3 corren contra el backend real (sin stubs):
// la API pública no expone forma de insertar un segundo precio para una
// compañía ya creada (no hay PATCH /api/company/{ticker}/price), así que
// los escenarios de US 4.4 (P&L positivo/negativo) y algunos de US 4.3
// (timestamp que cambia tras un nuevo batch, posición sin precio) usan
// cy.intercept con la forma real de PortfolioValue/PortfolioProfitLoss.
//
// US 4.5 y 4.6 (módulo yahoo-finance) no tienen superficie de UI — el batch
// es un proceso Python independiente. Están cubiertas por
// yahoo-finance/tests/*.py (pytest), no por Cypress.

describe('Feature 4 — Operaciones e historial', () => {
  const uniqueId = Date.now();
  const email = `f4_test_${uniqueId}@example.com`;
  const password = 'Password123!';
  const testTicker = `F4${String(uniqueId).slice(-6)}`;
  const testTicker2 = `F5${String(uniqueId).slice(-6)}`;
  const noPriceTicker = `NP${String(uniqueId).slice(-6)}`;
  const unitPrice = 100;

  // Algunos casos verifican cantidades/totales exactos (no solo presencia),
  // así que necesitan una compañía con ticker propio en vez de compartir
  // testTicker entre tests — de lo contrario, las compras acumuladas de
  // tests anteriores sobre el mismo usuario/ticker rompen el cálculo
  // esperado.
  let isolatedTickerCounter = 0;
  function freshFundedTicker(loginEmail: string, price: number) {
    isolatedTickerCounter += 1;
    const ticker = `I${String(uniqueId).slice(-5)}${isolatedTickerCounter}`;
    return cy.getAuthToken(loginEmail, password).then((token) =>
      cy
        .request({
          method: 'POST',
          url: endpoints.company.base(),
          body: { ticker, companyName: `Isolated ${ticker}`, price },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        .then(() => ticker)
    );
  }

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
      const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      cy.request({
        method: 'POST',
        url: endpoints.company.base(),
        body: {
          ticker: testTicker,
          companyName: 'Feature4 Corp',
          price: unitPrice,
        },
        headers: authHeaders,
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.be.oneOf([201, 409]));

      cy.request({
        method: 'POST',
        url: endpoints.company.base(),
        body: {
          ticker: testTicker2,
          companyName: 'Feature4 Second Corp',
          price: 50,
        },
        headers: authHeaders,
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.be.oneOf([201, 409]));

      cy.request({
        method: 'POST',
        url: endpoints.company.base(),
        body: { ticker: noPriceTicker, companyName: 'No Price Corp' },
        headers: authHeaders,
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.be.oneOf([201, 409]));
    });
  });

  // ─── US 4.1: Registro consistente de operaciones ──────────────────────────

  describe('US 4.1 — Registro consistente de operaciones', () => {
    beforeEach(() => {
      cy.login(email, password, '/');
      cy.get('[data-testid="portfolio-add-button"]', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('usuario autenticado con precio almacenado compra acciones y registra BUY', () => {
      cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
      buyPosition(testTicker, 10);
      cy.wait('@buyOp').then((interception) => {
        expect(interception.response?.statusCode).to.eq(201);
        expect(interception.response?.body.type).to.eq('BUY');
      });
    });

    it('compra exitosa aumenta o crea la posición correspondiente', () => {
      freshFundedTicker(email, unitPrice).then((ticker) => {
        buyPosition(ticker, 4);
        cy.get(`[data-testid="position-item-${ticker}"]`, {
          timeout: 10000,
        })
          .should('be.visible')
          .and('contain', '4');
      });
    });

    it('compra exitosa aparece en el historial', () => {
      buyPosition(testTicker, 2);
      cy.contains('History').click({ force: true });
      cy.get(`[data-testid="history-item-${testTicker}"]`, {
        timeout: 10000,
      })
        .first()
        .should('be.visible')
        .and('contain', 'Compra');
    });

    it('compañía sin precio almacenado → 422 al intentar comprar', () => {
      cy.intercept('POST', endpoints.portfolio.operations()).as('buyNoPrice');
      cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
      cy.get('[data-testid="add-position-buy-button"]').click({ force: true });
      cy.get('[data-testid="add-position-ticker-input"]').type(noPriceTicker, {
        force: true,
      });
      cy.get('[data-testid="add-position-quantity-input"]').type('1', {
        force: true,
      });
      cy.get('[data-testid="add-position-submit-button"]').click({
        force: true,
      });
      cy.wait('@buyNoPrice').its('response.statusCode').should('eq', 422);
      cy.get('[data-testid="add-position-error"]').should('be.visible');
    });

    it('usuario con acciones disponibles vende una cantidad válida y registra SELL', () => {
      buyPosition(testTicker, 8);
      cy.intercept('POST', endpoints.portfolio.operations()).as('sellOp');
      sellPosition(testTicker, 3);
      cy.wait('@sellOp').then((interception) => {
        expect(interception.response?.statusCode).to.eq(201);
        expect(interception.response?.body.type).to.eq('SELL');
      });
    });

    it('venta parcial reduce la posición sin eliminarla', () => {
      buyPosition(testTicker, 10);
      sellPosition(testTicker, 4);
      cy.get(`[data-testid="position-item-${testTicker}"]`, {
        timeout: 10000,
      }).should('be.visible');
    });

    it('venta total elimina o deja en 0 la posición', () => {
      freshFundedTicker(email, unitPrice).then((ticker) => {
        buyPosition(ticker, 5);
        sellPosition(ticker, 5);
        cy.get(`[data-testid="position-item-${ticker}"]`, {
          timeout: 10000,
        }).should('not.exist');
      });
    });

    it('venta mayor a la tenencia → 422 y no modifica portfolio ni historial', () => {
      buyPosition(testTicker, 2);

      cy.contains('History').click({ force: true });
      cy.get('[data-testid="history-list"]')
        .find('[data-testid^="history-item-"]')
        .its('length')
        .then((historyLengthBefore) => {
          cy.contains('Portfolio').click({ force: true });

          cy.intercept('POST', endpoints.portfolio.operations()).as('oversell');
          cy.get('[data-testid="portfolio-add-button"]').click({
            force: true,
          });
          cy.get('[data-testid="add-position-sell-button"]').click({
            force: true,
          });
          cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
            force: true,
          });
          cy.get('[data-testid="add-position-quantity-input"]').type('99999', {
            force: true,
          });
          cy.get('[data-testid="add-position-submit-button"]').click({
            force: true,
          });
          cy.wait('@oversell').its('response.statusCode').should('eq', 422);
          cy.get('[data-testid="add-position-error"]').should('be.visible');

          cy.contains('History').click({ force: true });
          cy.get('[data-testid="history-list"]')
            .find('[data-testid^="history-item-"]')
            .should('have.length', historyLengthBefore);
        });
    });

    it('cantidad 0 o negativa → 400 (bloqueado por validación)', () => {
      cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
      cy.get('[data-testid="add-position-ticker-input"]').type(testTicker, {
        force: true,
      });
      cy.get('[data-testid="add-position-quantity-input"]').type('0', {
        force: true,
      });
      cy.get('[data-testid="add-position-submit-button"]').click({
        force: true,
      });
      cy.contains('Quantity must be a whole number', { timeout: 5000 }).should(
        'be.visible'
      );
    });

    it('empresa inexistente → 404 al intentar operar', () => {
      cy.intercept('POST', endpoints.portfolio.operations()).as('unknownOp');
      cy.get('[data-testid="portfolio-add-button"]').click({ force: true });
      cy.get('[data-testid="add-position-ticker-input"]').type('NOEXISTE9999', {
        force: true,
      });
      cy.get('[data-testid="add-position-quantity-input"]').type('1', {
        force: true,
      });
      cy.get('[data-testid="add-position-submit-button"]').click({
        force: true,
      });
      cy.wait('@unknownOp').its('response.statusCode').should('eq', 404);
      cy.get('[data-testid="add-position-error"]').should('be.visible');
    });

    it('múltiples operaciones sobre el mismo ticker reflejan la posición agregada', () => {
      freshFundedTicker(email, unitPrice).then((ticker) => {
        buyPosition(ticker, 3);
        buyPosition(ticker, 2);
        cy.get(`[data-testid="position-item-${ticker}"]`, {
          timeout: 10000,
        }).should('contain', '5');
      });
    });
  });

  // ─── US 4.2: Historial de operaciones ──────────────────────────────────────

  describe('US 4.2 — Historial de operaciones', () => {
    const freshEmail = `f4_history_empty_${uniqueId}@example.com`;

    before(() => {
      cy.request({
        method: 'POST',
        url: endpoints.auth.register(),
        body: { email: freshEmail, password },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.be.oneOf([201, 409]));
    });

    beforeEach(() => {
      cy.login(email, password, '/');
      cy.get('[data-testid="portfolio-add-button"]', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('usuario con operaciones ve todas sus compras y ventas', () => {
      buyPosition(testTicker, 1);
      sellPosition(testTicker, 1);
      cy.contains('History').click({ force: true });
      cy.get(`[data-testid="history-item-${testTicker}"]`, {
        timeout: 10000,
      }).should('have.length.at.least', 2);
    });

    it('usuario sin operaciones recibe lista vacía con 200 OK', () => {
      cy.intercept('GET', endpoints.portfolio.history()).as('getHistory');
      cy.login(freshEmail, password, '/history');
      cy.wait('@getHistory').its('response.statusCode').should('eq', 200);
      cy.get('[data-testid="history-empty-state"]', { timeout: 10000 }).should(
        'be.visible'
      );
      cy.contains('No transactions yet').should('be.visible');
    });

    it('múltiples operaciones aparecen ordenadas por fecha descendente', () => {
      buyPosition(testTicker, 1);
      buyPosition(testTicker, 1);
      cy.contains('History').click({ force: true });
      cy.get('[data-testid="history-item-timestamp"]', {
        timeout: 10000,
      }).then(($timestamps) => {
        const first = new Date($timestamps.eq(0).text()).getTime();
        const second = new Date($timestamps.eq(1).text()).getTime();
        expect(first).to.be.gte(second);
      });
    });

    it('cada operación incluye fecha, tipo, compañía, ticker, cantidad y precios', () => {
      freshFundedTicker(email, unitPrice).then((ticker) => {
        buyPosition(ticker, 6);
        cy.contains('History').click({ force: true });
        cy.get(`[data-testid="history-item-${ticker}"]`)
          .first()
          .within(() => {
            cy.contains(ticker).should('be.visible');
            cy.contains(`Isolated ${ticker}`).should('be.visible');
            cy.contains('6').should('be.visible');
            cy.contains(`$${(6 * unitPrice).toFixed(2)}`).should('be.visible');
          });
      });
    });

    it('BUY y SELL se identifican claramente como compra o venta', () => {
      buyPosition(testTicker, 5);
      sellPosition(testTicker, 1);
      cy.contains('History').click({ force: true });
      cy.get(`[data-testid="history-item-${testTicker}"]`)
        .first()
        .within(() => {
          cy.contains('Venta').should('be.visible');
        });
    });

    it('el precio mostrado es el vigente al momento de la operación', () => {
      freshFundedTicker(email, unitPrice).then((ticker) => {
        cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
        buyPosition(ticker, 2);
        cy.wait('@buyOp').then((interception) => {
          expect(interception.response?.body.unitPrice).to.eq(unitPrice);
        });
        cy.contains('History').click({ force: true });
        cy.get(`[data-testid="history-item-${ticker}"]`)
          .first()
          .should('contain', `$${(2 * unitPrice).toFixed(2)}`);
      });
    });

    it('editar una entrada con campos válidos la actualiza correctamente', () => {
      cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
      buyPosition(testTicker, 7);
      cy.wait('@buyOp').then((interception) => {
        const id = interception.response?.body.id;

        cy.contains('History').click({ force: true });
        cy.intercept('PATCH', `${endpoints.portfolio.history()}/${id}`).as(
          'editOp'
        );
        cy.get(`[data-testid="edit-history-button-${id}"]`)
          .first()
          .click({ force: true });
        cy.get('[data-testid="edit-history-modal"]').should('be.visible');
        cy.get('[data-testid="edit-history-quantity-input"]').clear({
          force: true,
        });
        cy.get('[data-testid="edit-history-quantity-input"]').type('9', {
          force: true,
        });
        cy.get('[data-testid="edit-history-submit-button"]').click({
          force: true,
        });
        cy.wait('@editOp').its('response.statusCode').should('eq', 200);
        cy.get('[data-testid="edit-history-modal"]').should('not.exist');
      });
    });

    it('una edición que afecta la cantidad mantiene la consistencia del portfolio', () => {
      freshFundedTicker(email, unitPrice).then((ticker) => {
        cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
        buyPosition(ticker, 4);
        cy.wait('@buyOp').then((interception) => {
          const id = interception.response?.body.id;

          cy.contains('History').click({ force: true });
          cy.intercept('PATCH', `${endpoints.portfolio.history()}/${id}`).as(
            'editOp'
          );
          cy.get(`[data-testid="edit-history-button-${id}"]`)
            .first()
            .click({ force: true });
          cy.get('[data-testid="edit-history-quantity-input"]').clear({
            force: true,
          });
          cy.get('[data-testid="edit-history-quantity-input"]').type('11', {
            force: true,
          });
          cy.get('[data-testid="edit-history-submit-button"]').click({
            force: true,
          });
          cy.wait('@editOp');

          cy.contains('Portfolio').click({ force: true });
          cy.get(`[data-testid="position-item-${ticker}"]`, {
            timeout: 10000,
          }).should('contain', '11');
        });
      });
    });

    it('entrada inexistente → 404 al editar o eliminar', () => {
      cy.getAuthToken(email, password).then((token) => {
        cy.request({
          method: 'PATCH',
          url: `${endpoints.portfolio.history()}/999999999`,
          body: { quantity: 1 },
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          failOnStatusCode: false,
        }).then((res) => expect(res.status).to.eq(404));

        cy.request({
          method: 'DELETE',
          url: `${endpoints.portfolio.history()}/999999999`,
          headers: { Authorization: `Bearer ${token}` },
          failOnStatusCode: false,
        }).then((res) => expect(res.status).to.eq(404));
      });
    });

    it('una edición inválida → 400 Bad Request', () => {
      cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
      buyPosition(testTicker, 3);
      cy.wait('@buyOp').then((interception) => {
        const id = interception.response?.body.id;
        cy.getAuthToken(email, password).then((token) => {
          cy.request({
            method: 'PATCH',
            url: `${endpoints.portfolio.history()}/${id}`,
            body: { quantity: 0 },
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            failOnStatusCode: false,
          }).then((res) => expect(res.status).to.eq(400));
        });
      });
    });

    it('eliminar una entrada existente la saca del historial', () => {
      cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
      buyPosition(testTicker, 1);
      cy.wait('@buyOp').then((interception) => {
        const id = interception.response?.body.id;

        cy.contains('History').click({ force: true });
        cy.intercept('DELETE', `${endpoints.portfolio.history()}/${id}`).as(
          'deleteOp'
        );
        cy.get(`[data-testid="delete-history-button-${id}"]`).click({
          force: true,
        });
        cy.get('[data-testid="delete-history-modal"]').should('be.visible');
        cy.get('[data-testid="delete-history-confirm-button"]').click({
          force: true,
        });
        cy.wait('@deleteOp').its('response.statusCode').should('eq', 204);
      });
    });

    it('una eliminación que dejaría holdings negativos mantiene la consistencia (422)', () => {
      freshFundedTicker(email, unitPrice).then((ticker) => {
        cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
        buyPosition(ticker, 5);
        cy.wait('@buyOp').then((interception) => {
          const buyId = interception.response?.body.id;
          sellPosition(ticker, 5);

          cy.contains('History').click({ force: true });
          cy.intercept(
            'DELETE',
            `${endpoints.portfolio.history()}/${buyId}`
          ).as('deleteBuy');
          cy.get(`[data-testid="delete-history-button-${buyId}"]`).click({
            force: true,
          });
          cy.get('[data-testid="delete-history-confirm-button"]').click({
            force: true,
          });
          cy.wait('@deleteBuy').its('response.statusCode').should('eq', 422);
          cy.contains('negative holdings').should('be.visible');
        });
      });
    });

    it('un usuario no puede editar ni eliminar el historial de otro usuario', () => {
      const otherEmail = `f4_other_${uniqueId}@example.com`;
      cy.request({
        method: 'POST',
        url: endpoints.auth.register(),
        body: { email: otherEmail, password },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.be.oneOf([201, 409]));

      cy.intercept('POST', endpoints.portfolio.operations()).as('buyOp');
      buyPosition(testTicker, 1);
      cy.wait('@buyOp').then((interception) => {
        const id = interception.response?.body.id;

        cy.getAuthToken(otherEmail, password).then((otherToken) => {
          cy.request({
            method: 'PATCH',
            url: `${endpoints.portfolio.history()}/${id}`,
            body: { quantity: 2 },
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${otherToken}`,
            },
            failOnStatusCode: false,
          }).then((res) => expect(res.status).to.eq(404));

          cy.request({
            method: 'DELETE',
            url: `${endpoints.portfolio.history()}/${id}`,
            headers: { Authorization: `Bearer ${otherToken}` },
            failOnStatusCode: false,
          }).then((res) => expect(res.status).to.eq(404));
        });
      });
    });
  });

  // ─── US 4.3: Cálculo del valor actual del portfolio ───────────────────────

  describe('US 4.3 — Cálculo del valor actual del portfolio', () => {
    const valueEmail = `f4_value_${uniqueId}@example.com`;

    before(() => {
      cy.request({
        method: 'POST',
        url: endpoints.auth.register(),
        body: { email: valueEmail, password },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.be.oneOf([201, 409]));
    });

    beforeEach(() => {
      cy.login(valueEmail, password, '/');
      cy.get('[data-testid="portfolio-add-button"]', { timeout: 10000 }).should(
        'be.visible'
      );
    });

    it('el valor actual = cantidad × último precio almacenado', () => {
      buyPosition(testTicker, 3);
      cy.contains('View Current Value').click({ force: true });
      cy.get(`[data-testid="current-value-position-${testTicker}"]`, {
        timeout: 10000,
      }).should('contain', `$${(3 * unitPrice).toFixed(2)}`);
    });

    it('con múltiples posiciones se suman los valores actuales de todas', () => {
      freshFundedTicker(valueEmail, unitPrice).then((tickerA) => {
        freshFundedTicker(valueEmail, 50).then((tickerB) => {
          buyPosition(tickerA, 2);
          buyPosition(tickerB, 4);
          cy.contains('View Current Value').click({ force: true });
          cy.get('[data-testid="current-value-summary"]', {
            timeout: 10000,
          }).should('contain', `$${(2 * unitPrice + 4 * 50).toFixed(2)}`);
        });
      });
    });

    it('portfolio vacío → valor total es 0 (estado vacío sin error)', () => {
      const emptyEmail = `f4_value_empty_${uniqueId}@example.com`;
      cy.request({
        method: 'POST',
        url: endpoints.auth.register(),
        body: { email: emptyEmail, password },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.be.oneOf([201, 409]));

      cy.login(emptyEmail, password, '/current-value');
      cy.get('[data-testid="current-value-empty-state"]', {
        timeout: 10000,
      }).should('be.visible');
    });

    it('se muestra la fecha y hora de última actualización del precio', () => {
      buyPosition(testTicker, 1);
      cy.contains('View Current Value').click({ force: true });
      cy.get('[data-testid="current-value-last-updated"]', {
        timeout: 10000,
      })
        .should('be.visible')
        .and('contain', 'Last updated:');
    });

    // El resto de los escenarios de US 4.3 requieren un segundo precio para
    // la misma compañía (timestamp que cambia, posición sin precio) o una
    // verificación de que el backend nunca llama a Yahoo Finance en tiempo
    // real. La API pública no permite mutar precios después de crear la
    // compañía, así que se simulan con cy.intercept usando la forma real
    // de PortfolioValue.

    it('posición sin precio disponible se informa con advertencia explícita', () => {
      cy.intercept('GET', endpoints.portfolio.value(), {
        totalValue: 0,
        lastUpdatedAt: null,
        positions: [
          {
            ticker: 'NOPRC',
            companyName: 'No Price Co',
            quantity: 3,
            currentPrice: null,
            currentValue: null,
            lastUpdatedAt: null,
            priceSource: null,
            warning: 'Missing current price for NOPRC',
          },
        ],
        warnings: ['Missing current price for NOPRC'],
      }).as('getValueNoPrice');
      cy.intercept('GET', endpoints.portfolio.profitLoss(), {
        totalInvestedCost: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalReturnPercentage: 0,
        positions: [],
        warnings: [],
      }).as('getPnlEmpty');

      cy.reload();
      cy.contains('View Current Value').click({ force: true });
      cy.wait('@getValueNoPrice');
      cy.get('[data-testid="current-value-warning-NOPRC"]', {
        timeout: 10000,
      })
        .should('be.visible')
        .and('contain', 'Missing current price');
    });

    it('una nueva actualización del batch cambia el timestamp mostrado', () => {
      const firstTimestamp = '2026-01-01T10:00:00.000Z';
      const secondTimestamp = '2026-01-02T15:30:00.000Z';

      const valuePayload = (lastUpdatedAt: string) => ({
        totalValue: 100,
        lastUpdatedAt,
        positions: [
          {
            ticker: testTicker,
            companyName: 'Feature4 Corp',
            quantity: 1,
            currentPrice: 100,
            currentValue: 100,
            lastUpdatedAt,
            priceSource: 'YAHOO_FINANCE',
            warning: null,
          },
        ],
        warnings: [],
      });
      const pnlPayload = {
        totalInvestedCost: 100,
        totalCurrentValue: 100,
        totalProfitLoss: 0,
        totalReturnPercentage: 0,
        positions: [],
        warnings: [],
      };

      cy.intercept(
        'GET',
        endpoints.portfolio.value(),
        valuePayload(firstTimestamp)
      ).as('getValue1');
      cy.intercept('GET', endpoints.portfolio.profitLoss(), pnlPayload).as(
        'getPnl1'
      );
      cy.reload();
      cy.contains('View Current Value').click({ force: true });
      cy.wait('@getValue1');
      cy.contains(new Date(firstTimestamp).toLocaleString()).should(
        'be.visible'
      );

      cy.intercept(
        'GET',
        endpoints.portfolio.value(),
        valuePayload(secondTimestamp)
      ).as('getValue2');
      cy.intercept('GET', endpoints.portfolio.profitLoss(), pnlPayload).as(
        'getPnl2'
      );
      cy.reload();
      cy.wait('@getValue2');
      cy.contains(new Date(secondTimestamp).toLocaleString()).should(
        'be.visible'
      );
    });
  });

  // ─── US 4.4: Análisis de ganancia y pérdida ───────────────────────────────
  //
  // Todos los escenarios necesitan un precio actual distinto del precio de
  // compra, algo que la API pública no permite simular contra el backend
  // real. Se testean con cy.intercept usando la forma real de
  // PortfolioProfitLoss/ProfitLossPositionResponse — esto valida que el
  // frontend renderiza correctamente lo que el backend calcula; el cálculo
  // en sí (costo promedio ponderado, signo del retorno, etc.) está cubierto
  // por PortfolioFeature4E2ETests.kt en el backend.

  describe('US 4.4 — Análisis de ganancia y pérdida', () => {
    const pnlEmail = `f4_pnl_${uniqueId}@example.com`;

    before(() => {
      cy.request({
        method: 'POST',
        url: endpoints.auth.register(),
        body: { email: pnlEmail, password },
        headers: { 'Content-Type': 'application/json' },
        failOnStatusCode: false,
      }).then((res) => expect(res.status).to.be.oneOf([201, 409]));
    });

    function stub(
      profitLoss: Record<string, unknown>,
      value?: Record<string, unknown>
    ) {
      cy.intercept('GET', endpoints.portfolio.profitLoss(), profitLoss).as(
        'getPnl'
      );
      cy.intercept(
        'GET',
        endpoints.portfolio.value(),
        value ?? {
          totalValue: 0,
          lastUpdatedAt: null,
          positions: [],
          warnings: [],
        }
      ).as('getValue');
    }

    function visitCurrentValue() {
      cy.login(pnlEmail, password, '/current-value');
      cy.get('[data-testid="current-value-screen"]', {
        timeout: 10000,
      }).should('be.visible');
      cy.wait('@getValue');
      cy.wait('@getPnl');
    }

    it('precio actual mayor al de compra → P&L positivo', () => {
      stub(
        {
          totalInvestedCost: 1000,
          totalCurrentValue: 1200,
          totalProfitLoss: 200,
          totalReturnPercentage: 20,
          positions: [
            {
              ticker: testTicker,
              companyName: 'Feature4 Corp',
              quantity: 10,
              averageCost: 100,
              currentPrice: 120,
              priceSource: 'YAHOO_FINANCE',
              investedCost: 1000,
              currentValue: 1200,
              profitLoss: 200,
              returnPercentage: 20,
              warning: null,
            },
          ],
          warnings: [],
        },
        {
          totalValue: 1200,
          lastUpdatedAt: '2026-01-01T00:00:00Z',
          positions: [
            {
              ticker: testTicker,
              companyName: 'Feature4 Corp',
              quantity: 10,
              currentPrice: 120,
              currentValue: 1200,
              lastUpdatedAt: '2026-01-01T00:00:00Z',
              priceSource: 'YAHOO_FINANCE',
              warning: null,
            },
          ],
          warnings: [],
        }
      );
      visitCurrentValue();
      cy.get(`[data-testid="current-value-position-${testTicker}"]`).should(
        'contain',
        '+$200.00'
      );
      cy.get('[data-testid="current-value-summary"]').should(
        'contain',
        '+$200.00'
      );
    });

    it('precio actual menor al de compra → P&L negativo', () => {
      stub(
        {
          totalInvestedCost: 1000,
          totalCurrentValue: 800,
          totalProfitLoss: -200,
          totalReturnPercentage: -20,
          positions: [
            {
              ticker: testTicker,
              companyName: 'Feature4 Corp',
              quantity: 10,
              averageCost: 100,
              currentPrice: 80,
              priceSource: 'YAHOO_FINANCE',
              investedCost: 1000,
              currentValue: 800,
              profitLoss: -200,
              returnPercentage: -20,
              warning: null,
            },
          ],
          warnings: [],
        },
        {
          totalValue: 800,
          lastUpdatedAt: '2026-01-01T00:00:00Z',
          positions: [
            {
              ticker: testTicker,
              companyName: 'Feature4 Corp',
              quantity: 10,
              currentPrice: 80,
              currentValue: 800,
              lastUpdatedAt: '2026-01-01T00:00:00Z',
              priceSource: 'YAHOO_FINANCE',
              warning: null,
            },
          ],
          warnings: [],
        }
      );
      visitCurrentValue();
      cy.get(`[data-testid="current-value-position-${testTicker}"]`).should(
        'contain',
        '-$200.00'
      );
    });

    it('precio actual igual al de compra → P&L es 0', () => {
      stub(
        {
          totalInvestedCost: 1000,
          totalCurrentValue: 1000,
          totalProfitLoss: 0,
          totalReturnPercentage: 0,
          positions: [
            {
              ticker: testTicker,
              companyName: 'Feature4 Corp',
              quantity: 10,
              averageCost: 100,
              currentPrice: 100,
              priceSource: 'YAHOO_FINANCE',
              investedCost: 1000,
              currentValue: 1000,
              profitLoss: 0,
              returnPercentage: 0,
              warning: null,
            },
          ],
          warnings: [],
        },
        {
          totalValue: 1000,
          lastUpdatedAt: '2026-01-01T00:00:00Z',
          positions: [
            {
              ticker: testTicker,
              companyName: 'Feature4 Corp',
              quantity: 10,
              currentPrice: 100,
              currentValue: 1000,
              lastUpdatedAt: '2026-01-01T00:00:00Z',
              priceSource: 'YAHOO_FINANCE',
              warning: null,
            },
          ],
          warnings: [],
        }
      );
      visitCurrentValue();
      cy.get(`[data-testid="current-value-position-${testTicker}"]`).should(
        'contain',
        '+$0.00'
      );
    });

    it('datos insuficientes muestran advertencia en vez de un cálculo incorrecto', () => {
      stub({
        totalInvestedCost: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalReturnPercentage: 0,
        positions: [
          {
            ticker: testTicker,
            companyName: 'Feature4 Corp',
            quantity: 5,
            averageCost: null,
            currentPrice: null,
            priceSource: null,
            investedCost: null,
            currentValue: null,
            profitLoss: null,
            returnPercentage: null,
            warning: `Insufficient data to calculate P&L for ${testTicker}`,
          },
        ],
        warnings: [`Insufficient data to calculate P&L for ${testTicker}`],
      });
      visitCurrentValue();
      cy.get(`[data-testid="current-value-warning-${testTicker}"]`).should(
        'contain',
        'Insufficient data'
      );
    });

    it('con varias posiciones se devuelve la ganancia/pérdida total agregada', () => {
      stub({
        totalInvestedCost: 1500,
        totalCurrentValue: 1800,
        totalProfitLoss: 300,
        totalReturnPercentage: 20,
        positions: [
          {
            ticker: testTicker,
            companyName: 'Feature4 Corp',
            quantity: 10,
            averageCost: 100,
            currentPrice: 130,
            priceSource: 'YAHOO_FINANCE',
            investedCost: 1000,
            currentValue: 1300,
            profitLoss: 300,
            returnPercentage: 30,
            warning: null,
          },
          {
            ticker: testTicker2,
            companyName: 'Feature4 Second Corp',
            quantity: 10,
            averageCost: 50,
            currentPrice: 50,
            priceSource: 'YAHOO_FINANCE',
            investedCost: 500,
            currentValue: 500,
            profitLoss: 0,
            returnPercentage: 0,
            warning: null,
          },
        ],
        warnings: [],
      });
      visitCurrentValue();
      cy.get('[data-testid="current-value-summary"]').should(
        'contain',
        '+$300.00'
      );
    });

    it('portfolio vacío → análisis devuelve estado vacío sin error', () => {
      stub({
        totalInvestedCost: 0,
        totalCurrentValue: 0,
        totalProfitLoss: 0,
        totalReturnPercentage: 0,
        positions: [],
        warnings: [],
      });
      visitCurrentValue();
      cy.get('[data-testid="current-value-empty-state"]').should('be.visible');
    });
  });
});
