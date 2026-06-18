import { browser, $ } from '@wdio/globals';

// Selector por testID — con la New Architecture (Fabric) el testID se expone
// como resource-id en Android, no como content-desc
export const el = (testId: string) =>
  $(`android=new UiSelector().resourceId("${testId}")`);

// Endpoints centralizados (mismo patrón que Cypress)
const apiUrl = () =>
  (browser as any).options.env?.apiUrl ?? 'http://localhost:8080';

export const endpoints = {
  auth: {
    register: () => `${apiUrl()}/api/auth/register`,
    login: () => `${apiUrl()}/api/auth/login`,
  },
  portfolio: {
    operations: () => `${apiUrl()}/api/portfolio/operations`,
  },
};

// Registra un usuario via API (sin UI)
export async function registerUser(email: string, password: string) {
  const res = await fetch(endpoints.auth.register(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (![201, 409].includes(res.status)) {
    throw new Error(`Register failed: ${res.status}`);
  }
}

// Obtiene token via API
export async function getToken(
  email: string,
  password: string
): Promise<string> {
  const res = await fetch(endpoints.auth.login(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json();
  return body.token as string;
}

// Espera a que un elemento con testID sea visible
export async function waitForElement(testId: string, timeout = 15000) {
  await el(testId).waitForDisplayed({ timeout });
}

// Escribe texto en un campo
export async function typeInto(testId: string, text: string) {
  const input = el(testId);
  await input.waitForDisplayed({ timeout: 10000 });
  await input.click();
  await input.setValue(text);
}

// Toca un elemento
export async function tap(testId: string) {
  const elem = el(testId);
  await elem.waitForDisplayed({ timeout: 10000 });
  await elem.click();
}

// Agrega una posición BUY via UI
export async function buyPosition(ticker: string, quantity: string) {
  await tap('portfolio-add-button');
  await tap('add-position-buy-button');
  await typeInto('add-position-ticker-input', ticker);
  await typeInto('add-position-quantity-input', quantity);
  await tap('add-position-submit-button');
  await el('add-position-modal').waitForDisplayed({
    timeout: 5000,
    reverse: true,
  });
}
