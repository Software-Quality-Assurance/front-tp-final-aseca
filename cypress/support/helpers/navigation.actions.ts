export function goToHistory() {
  cy.get('[data-testid="tab-history"]').click();
  cy.url().should('include', '/history');
  cy.waitForScreen('history-screen');
}

export function goToPortfolio() {
  cy.get('[data-testid="tab-portfolio"]').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
  cy.waitForScreen('portfolio-screen');
}
