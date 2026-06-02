/// <reference types="cypress" />

import { endpoints } from './endpoints';

export const AUTH_TOKEN_KEY = 'app_token_v1';

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string, path?: string): Chainable<void>;
      waitForScreen(testId: string): Chainable<void>;
      clickButton(label: string | RegExp): Chainable<void>;
      getAuthToken(email: string, password: string): Chainable<string>;
    }
  }
}

Cypress.Commands.add('waitForScreen', (testId: string) => {
  cy.get('[data-testid="splash-overlay"]', { timeout: 10000 }).should(
    'not.exist'
  );
  cy.get(`[data-testid="${testId}"]`, { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('clickButton', (label: string | RegExp) => {
  cy.contains('[role="button"]', label, { timeout: 10000 }).click({
    force: true,
  });
});

Cypress.Commands.add('getAuthToken', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: endpoints.auth.login(),
    body: { email, password },
    headers: { 'Content-Type': 'application/json' },
  }).then((res) => {
    expect(res.status).to.eq(200);
    return res.body.token as string;
  });
});

// Logs in via API and seeds localStorage before the app loads.
Cypress.Commands.add(
  'login',
  (email: string, password: string, path: string = '/') => {
    cy.getAuthToken(email, password).then((token) => {
      cy.visit(path, {
        onBeforeLoad(win) {
          win.localStorage.setItem(AUTH_TOKEN_KEY, token);
        },
      });
    });
  }
);

export {};
