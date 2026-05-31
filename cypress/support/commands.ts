/// <reference types="cypress" />

import { endpoints } from './endpoints'

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      waitForScreen(testId: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('waitForScreen', (testId: string) => {
  cy.get('[data-testid="splash-overlay"]', { timeout: 10000 }).should('not.exist')
  cy.get(`[data-testid="${testId}"]`, { timeout: 10000 }).should('be.visible')
})

// Logs in programmatically via API — bypasses UI for test setup
// (UI login is tested separately in auth.cy.ts)
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: endpoints.auth.login(),
    body: { email, password },
    headers: { 'Content-Type': 'application/json' },
  }).then(res => {
    window.localStorage.setItem('app_token_v1', res.body.token)
  })
})

export {}
