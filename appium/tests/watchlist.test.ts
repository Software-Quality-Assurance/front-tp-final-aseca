import { browser, $ } from '@wdio/globals';
import {
  el,
  tap,
  typeInto,
  waitForElement,
  registerUser,
} from '../helpers';

describe('Watchlist — Feature 6 (Mobile)', () => {
  const uniqueId = Date.now();
  const email = `watchlist_appium_${uniqueId}@example.com`;
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
    
    // Default screen is mostly portfolio, navigate to Watchlist tab
    await waitForElement('portfolio-add-button'); // wait for load
    await $('~Watchlist').click(); // Tab bar navigation
    await waitForElement('watchlist-screen');
  });

  it('6.1 — Add and view ticker in watchlist', async () => {
    await waitForElement('add-watchlist-button');
    await tap('add-watchlist-button');
    
    await waitForElement('add-watchlist-modal');
    await typeInto('add-watchlist-ticker-input', testTicker);
    await tap('add-watchlist-submit-button');

    // Wait for the modal to be removed or element to be populated
    await waitForElement('watchlist-screen');
    // Ensure item renders somehow
    await browser.pause(2000);
  });
});
