describe('Auth flows', () => {
  const uniqueId = Date.now();
  const testEmail = `testuser_${uniqueId}@example.com`;
  const updatedEmail = `updateduser_${uniqueId}@example.com`;
  const testPass = 'Password123!';

  function waitForScreen(screenTestId: string) {
    cy.get('[data-testid="splash-overlay"]', { timeout: 10000 }).should(
      'not.exist'
    );
    cy.get(`[data-testid="${screenTestId}"]`, { timeout: 10000 }).should(
      'be.visible'
    );
  }

  it('registers a new user and navigates to login', () => {
    cy.visit('/register');
    waitForScreen('register-screen');

    cy.get('[data-testid="register-email-input"]')
      .should('not.be.disabled')
      .type(testEmail, { force: true });
    cy.get('[data-testid="register-password-input"]')
      .should('not.be.disabled')
      .type(testPass, { force: true });
    cy.clickButton('Create account');

    // Success message is shown and then navigation occurs to /login
    cy.contains('Account created. You can now log in.', { timeout: 10000 });
    cy.url().should('include', '/login');
  });

  it('shows error when registering an existing email (409)', () => {
    cy.visit('/register');
    waitForScreen('register-screen');
    cy.get('[data-testid="register-email-input"]')
      .should('not.be.disabled')
      .type(testEmail, { force: true });
    cy.get('[data-testid="register-password-input"]')
      .should('not.be.disabled')
      .type(testPass, { force: true });
    cy.clickButton('Create account');

    cy.contains('Registration failed', { timeout: 10000 }).should('exist');
  });

  it('shows generic message on invalid login', () => {
    cy.visit('/login');
    waitForScreen('login-screen');
    cy.get('[data-testid="login-email-input"]')
      .should('not.be.disabled')
      .type('baduser_nonexistent@example.com', { force: true });
    cy.get('[data-testid="login-password-input"]')
      .should('not.be.disabled')
      .type('WrongPassword!', { force: true });
    cy.clickButton('Login');

    // The actual error text depends on the backend mapping, but includes one of these keywords usually
    cy.contains(/Invalid credentials|Login failed/, { timeout: 10000 }).should(
      'exist'
    );
  });

  it('logs in successfully and shows profile', () => {
    cy.visit('/login');
    waitForScreen('login-screen');
    cy.get('[data-testid="login-email-input"]')
      .should('not.be.disabled')
      .type(testEmail, { force: true });
    cy.get('[data-testid="login-password-input"]')
      .should('not.be.disabled')
      .type(testPass, { force: true });
    cy.clickButton('Login');

    // Should be redirected to the profile page
    cy.url().should('include', '/profile');
    cy.contains('Profile', { timeout: 10000 }).should('exist');
  });

  it('updates profile email', () => {
    // Re-login because Cypress clears localStorage between iterations
    cy.visit('/login');
    waitForScreen('login-screen');
    cy.get('[data-testid="login-email-input"]')
      .should('not.be.disabled')
      .type(testEmail, { force: true });
    cy.get('[data-testid="login-password-input"]')
      .should('not.be.disabled')
      .type(testPass, { force: true });
    cy.clickButton('Login');
    cy.url().should('include', '/profile');

    // Setup window.alert catcher for web
    cy.on('window:alert', (text) => {
      expect(text).to.include('Your profile was updated');
    });

    cy.get('[data-testid="profile-email-input"]')
      .should('not.be.disabled')
      .clear({ force: true });
    cy.get('[data-testid="profile-email-input"]')
      .should('not.be.disabled')
      .type(updatedEmail, { force: true });
    cy.clickButton('Save changes');

    // Verify input stays correctly typed
    cy.get('[data-testid="profile-email-input"]').should(
      'have.value',
      updatedEmail
    );
  });

  it('logs out and redirects to login', () => {
    cy.visit('/login');
    waitForScreen('login-screen');
    // Must use updated email
    cy.get('[data-testid="login-email-input"]')
      .should('not.be.disabled')
      .type(updatedEmail, { force: true });
    cy.get('[data-testid="login-password-input"]')
      .should('not.be.disabled')
      .type(testPass, { force: true });
    cy.clickButton('Login');
    cy.url().should('include', '/profile');

    // Click logout button
    cy.clickButton('Logout');
    cy.url().should('include', '/login');
  });

  it('deletes account successfully', () => {
    cy.visit('/login');
    waitForScreen('login-screen');
    cy.get('[data-testid="login-email-input"]')
      .should('not.be.disabled')
      .type(updatedEmail, { force: true });
    cy.get('[data-testid="login-password-input"]')
      .should('not.be.disabled')
      .type(testPass, { force: true });
    cy.clickButton('Login');
    cy.url().should('include', '/profile');

    // Auto-accept confirm dialog
    cy.on('window:confirm', () => true);
    cy.on('window:alert', (text) => {
      expect(text).to.include('Your account was deleted');
    });

    cy.clickButton('Delete account');

    // Should be redirected mapping out of profile
    cy.url().should('not.include', '/profile');
  });
});
