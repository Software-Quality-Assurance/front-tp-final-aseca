export function goToHistory() {
  cy.get('[data-testid="nav-history"]').click();
  cy.url().should('include', '/history');
  cy.waitForScreen('history-screen');
}

export function goToPortfolio() {
  cy.get('[data-testid="nav-portfolio"]').click();
  cy.url().should('eq', Cypress.config().baseUrl + '/');
  cy.waitForScreen('portfolio-screen');
}
