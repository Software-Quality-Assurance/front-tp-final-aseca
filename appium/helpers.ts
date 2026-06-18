import { browser, $ } from '@wdio/globals';
import fs from 'fs';
import path from 'path';

const APP_ID = 'com.anonymous.fronttpfinalaseca';
const DEFAULT_TIMEOUT = 30000;
const SHORT_TIMEOUT = 2000;
const REDBOX_TITLE_SELECTOR = `//*[contains(@resource-id,"catalyst_redbox_title")]`;
const REDBOX_RELOAD_SELECTOR = `//*[contains(@resource-id,"rn_redbox_reload_button")]`;
const SPLASH_ICON_SELECTOR = `//*[@resource-id="android:id/splashscreen_icon_view"]`;

type Credentials = {
  email: string;
  password: string;
};

const apiUrl = () =>
  process.env.APPIUM_API_URL ??
  (browser as any).options?.env?.apiUrl ??
  'http://localhost:8080';

const fallbackSelector = (id: string) =>
  `//*[@resource-id="${id}" or @content-desc="${id}"]`;

const knownScreens = [
  'login-screen',
  'register-screen',
  'portfolio-screen',
  'current-value-screen',
  'history-screen',
  'watchlist-screen',
  'explore-screen',
  'profile-screen',
] as const;

async function captureFailureArtifacts(id: string) {
  const ts = Date.now();
  const dir = path.resolve('./appium/artifacts');
  fs.mkdirSync(dir, { recursive: true });
  await browser.saveScreenshot(path.join(dir, `notfound-${id}-${ts}.png`));
  const source = await browser.getPageSource();
  fs.writeFileSync(path.join(dir, `notfound-${id}-${ts}.xml`), source, 'utf8');
}

async function isRedboxVisible(timeout = SHORT_TIMEOUT) {
  try {
    const element = $(REDBOX_TITLE_SELECTOR);
    await element.waitForDisplayed({ timeout });
    return true;
  } catch {
    return false;
  }
}

async function recoverFromRedbox() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (!(await isRedboxVisible(1000))) {
      return;
    }

    const reloadButton = $(REDBOX_RELOAD_SELECTOR);
    await reloadButton.click();
    await browser.pause(4000);

    if (!(await isRedboxVisible(1000))) {
      return;
    }
  }

  await browser.terminateApp(APP_ID);
  await browser.activateApp(APP_ID);
  await browser.pause(5000);
}

async function isSplashVisible(timeout = SHORT_TIMEOUT) {
  try {
    const element = $(SPLASH_ICON_SELECTOR);
    await element.waitForDisplayed({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function findById(id: string) {
  const accessibilityElement = $(`~${id}`);
  if (await accessibilityElement.isExisting()) {
    return accessibilityElement;
  }

  return $(fallbackSelector(id));
}

export async function isVisible(id: string, timeout = SHORT_TIMEOUT) {
  try {
    const element = await findById(id);
    await element.waitForDisplayed({ timeout });
    return true;
  } catch {
    return false;
  }
}

export async function waitForVisible(id: string, timeout = DEFAULT_TIMEOUT) {
  await browser.pause(1500);

  try {
    const element = await findById(id);
    await element.waitForDisplayed({ timeout });
    return element;
  } catch (error) {
    await captureFailureArtifacts(id);
    throw error;
  }
}

export async function waitForAny(
  ids: readonly string[],
  timeout = DEFAULT_TIMEOUT
) {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    if (await isRedboxVisible(500)) {
      await recoverFromRedbox();
    }

    for (const id of ids) {
      if (await isVisible(id, 500)) {
        return id;
      }
    }

    await browser.pause(250);
  }

  await captureFailureArtifacts(ids.join('-or-'));
  throw new Error(`None of these elements became visible: ${ids.join(', ')}`);
}

export async function tap(id: string) {
  const element = await waitForVisible(id);
  await element.click();
}

export async function typeText(id: string, value: string) {
  const element = await waitForVisible(id);
  await element.click();
  await element.clearValue();
  // UiAutomator2 replaceValue/setValue may append a NUL terminator on some
  // emulator images. addValue uses normal key input and avoids sending 0x00
  // into React Native TextInput values.
  await element.addValue(value);
}

export async function startApp() {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      await waitForAny(knownScreens, 20000);
      return;
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }

      if (await isRedboxVisible(500)) {
        await recoverFromRedbox();
      } else if (await isSplashVisible(1000)) {
        await browser.terminateApp(APP_ID);
        await browser.activateApp(APP_ID);
        await browser.pause(5000);
      } else {
        await browser.activateApp(APP_ID);
        await browser.pause(3000);
      }
    }
  }
}

export async function openTab(tabId: string, screenId: string) {
  if (await isVisible(screenId)) {
    return;
  }

  await tap(tabId);
  await waitForVisible(screenId);
}

export async function ensureLoggedOut() {
  await startApp();

  if (await isVisible('login-screen')) {
    return;
  }

  if (await isVisible('register-screen')) {
    await tap('go-to-login-link');
    await waitForVisible('login-screen');
    return;
  }

  if (!(await isVisible('profile-screen'))) {
    await openTab('tab-profile', 'profile-screen');
  }

  await tap('profile-logout-button');
  await waitForVisible('login-screen');
}

export async function loginWithCredentials({ email, password }: Credentials) {
  await ensureLoggedOut();
  await typeText('login-email-input', email);
  await typeText('login-password-input', password);

  try {
    await browser.hideKeyboard();
  } catch {
    // Keyboard is not always open on Android emulator.
  }

  await tap('login-submit-button');
  await waitForVisible('portfolio-screen');
}

export function buildCredentials(prefix: string): Credentials {
  const unique = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: `${prefix}_${unique}@example.com`,
    password: 'Password123!',
  };
}

export async function registerUserViaApi({ email, password }: Credentials) {
  const response = await fetch(`${apiUrl()}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (![201, 409].includes(response.status)) {
    throw new Error(`Register failed with status ${response.status}`);
  }
}

export async function createAuthenticatedSession(prefix: string) {
  const credentials = buildCredentials(prefix);
  await registerUserViaApi(credentials);
  await loginWithCredentials(credentials);
  return credentials;
}

export async function openRegisterScreen() {
  await startApp();

  if (await isVisible('register-screen')) {
    return;
  }

  await ensureLoggedOut();
  await tap('go-to-register-link');
  await waitForVisible('register-screen');
}

export async function openLoginScreen() {
  await waitForVisible('register-screen');
  await tap('go-to-login-link');
  await waitForVisible('login-screen');
}

export async function openCurrentValueScreen() {
  await waitForVisible('portfolio-screen');
  await tap('portfolio-current-value-link');
  await waitForVisible('current-value-screen');
}

export async function registerWithUi(credentials: Credentials) {
  await openRegisterScreen();
  await typeText('register-email-input', credentials.email);
  await typeText('register-password-input', credentials.password);

  try {
    await browser.hideKeyboard();
  } catch {
    // noop
  }

  await tap('register-submit-button');
}

export async function addPosition(ticker: string, quantity: string) {
  await tap('portfolio-add-button');
  await waitForVisible('add-position-modal');
  await tap('add-position-buy-button');
  await typeText('add-position-ticker-input', ticker);
  await typeText('add-position-quantity-input', quantity);

  try {
    await browser.hideKeyboard();
  } catch {
    // noop
  }

  await tap('add-position-submit-button');
  await waitForVisible(`position-item-${ticker}`);
}

export async function addWatchlistTicker(ticker: string) {
  await tap('add-watchlist-button');
  await waitForVisible('add-watchlist-modal');
  await typeText('add-watchlist-ticker-input', ticker);

  try {
    await browser.hideKeyboard();
  } catch {
    // noop
  }

  await tap('add-watchlist-submit-button');
  await waitForVisible(`watchlist-item-${ticker}`);
}

export async function searchCompany(ticker: string) {
  await typeText('company-search-input', ticker);

  try {
    await browser.hideKeyboard();
  } catch {
    // noop
  }

  await tap('company-search-button');
  await waitForVisible('company-search-results');
  await tap(`search-result-${ticker}`);
  await waitForVisible('company-metrics-card');
}

export async function logoutFromProfile() {
  await openTab('tab-profile', 'profile-screen');
  await tap('profile-logout-button');
  await waitForVisible('login-screen');
}

export { APP_ID };
