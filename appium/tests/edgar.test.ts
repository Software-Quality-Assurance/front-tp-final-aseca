import { browser, $ } from '@wdio/globals';
import {
  el,
  tap,
  typeInto,
  waitForElement,
  registerUser,
} from '../helpers';

describe('EDGAR Explorer — Feature 6 (Mobile)', () => {
  const uniqueId = Date.now();
  const email = `edgar_appium_${uniqueId}@example.com`;
  const password = 'Password123!';
  const testTicker = 'AAPL';

  before(async () => {
    await registerUser(email, password);
  });

  beforeEach(async () => {
    await waitForElement('login-screen');
    await typeInto('login-email-input', email);
    await typeInto('login-password-input', password);
    await browser.hideKeyboard();
    await $('~Login').click();
    
    // Default screen portfolio -> Navigate to Explore tab
    await waitForElement('portfolio-add-button');
    await $('~Explore').click();
    await waitForElement('explore-screen');
  });

  it('6.3 & 6.4 — Search for company and view metrics', async () => {
    await waitForElement('company-search-input');
    await typeInto('company-search-input', testTicker);
    await tap('company-search-button');

    await waitForElement('company-search-results');
    await tap(`search-result-${testTicker}`);

    await waitForElement('company-metrics-card');
    await waitForElement('company-history-card');
  });
});
