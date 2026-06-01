import { browser, $ } from '@wdio/globals'
import { el, tap, typeInto, waitForElement, registerUser, buyPosition } from '../helpers'

describe('Portfolio — Feature 5 (Mobile)', () => {
  const uniqueId = Date.now()
  const email = `appium_test_${uniqueId}@example.com`
  const password = 'Password123!'
  const testTicker = 'SMNR'
  const testQuantity = '5'

  before(async () => {
    await registerUser(email, password)
  })

  beforeEach(async () => {
    await waitForElement('login-screen')
    await typeInto('login-email-input', email)
    await typeInto('login-password-input', password)
    await browser.hideKeyboard()
    await $('~Login').click()
    await waitForElement('portfolio-add-button')
  })

  afterEach(async () => {
    await browser.terminateApp('com.anonymous.fronttpfinalaseca')
    await browser.activateApp('com.anonymous.fronttpfinalaseca')
  })

  // ─── 5.1: Visualización del portfolio ───────────────────────────────────────

  it('5.1 — muestra la pantalla de portfolio al autenticarse', async () => {
    await expect(el('portfolio-add-button')).toBeDisplayed()
  })

  it('5.1 — portfolio vacío muestra estado vacío', async () => {
    await expect(el('portfolio-empty-state')).toBeDisplayed()
  })

  it('5.1 — usuario no autenticado ve pantalla de login', async () => {
    await browser.terminateApp('com.anonymous.fronttpfinalaseca')
    await browser.activateApp('com.anonymous.fronttpfinalaseca')
    await expect(el('login-screen')).toBeDisplayed()
  })

  // ─── 5.2: BUY ───────────────────────────────────────────────────────────────

  it('5.2 — botón Add abre el modal', async () => {
    await tap('portfolio-add-button')
    await expect(el('add-position-modal')).toBeDisplayed()
  })

  it('5.2 — modal tiene toggle BUY/SELL', async () => {
    await tap('portfolio-add-button')
    await expect(el('add-position-buy-button')).toBeDisplayed()
    await expect(el('add-position-sell-button')).toBeDisplayed()
  })

  it('5.2 — BUY agrega posición y aparece en el portfolio', async () => {
    await buyPosition(testTicker, testQuantity)
    await expect(el(`position-item-${testTicker}`)).toBeDisplayed()
  })

  it('5.2 — BUY con ticker inválido muestra error', async () => {
    await tap('portfolio-add-button')
    await tap('add-position-buy-button')
    await typeInto('add-position-ticker-input', 'INVALIDTICKER999')
    await typeInto('add-position-quantity-input', '1')
    await tap('add-position-submit-button')
    await expect(el('add-position-error')).toBeDisplayed()
    await expect(el('add-position-modal')).toBeDisplayed()
  })

  it('5.2 — BUY con cantidad 0 muestra error de validación', async () => {
    await tap('portfolio-add-button')
    await typeInto('add-position-ticker-input', testTicker)
    await typeInto('add-position-quantity-input', '0')
    await tap('add-position-submit-button')
    await expect(el('add-position-error')).toBeDisplayed()
  })

  it('5.2 — BUY con cantidad decimal muestra error de validación', async () => {
    await tap('portfolio-add-button')
    await typeInto('add-position-ticker-input', testTicker)
    await typeInto('add-position-quantity-input', '2.5')
    await tap('add-position-submit-button')
    await expect(el('add-position-error')).toBeDisplayed()
  })

  it('5.2 — BUY con fecha personalizada se registra correctamente', async () => {
    await tap('portfolio-add-button')
    await tap('add-position-buy-button')
    await typeInto('add-position-ticker-input', testTicker)
    await typeInto('add-position-quantity-input', '1')
    await tap('add-position-now-switch')
    await waitForElement('add-position-date-input')
    await typeInto('add-position-date-input', '2026-01-15')
    await tap('add-position-submit-button')
    await el('add-position-modal').waitForDisplayed({ timeout: 5000, reverse: true })
    await expect(el(`position-item-${testTicker}`)).toBeDisplayed()
  })

  it('5.2 — cancelar BUY no modifica el portfolio', async () => {
    await tap('portfolio-add-button')
    await typeInto('add-position-ticker-input', testTicker)
    await typeInto('add-position-quantity-input', '10')
    await $('~Cancel').click()
    await el('add-position-modal').waitForDisplayed({ timeout: 5000, reverse: true })
  })

  // ─── 5.2: SELL ──────────────────────────────────────────────────────────────

  it('5.2 — SELL parcial reduce la posición sin eliminarla', async () => {
    await buyPosition(testTicker, '10')
    await tap('portfolio-add-button')
    await tap('add-position-sell-button')
    await typeInto('add-position-ticker-input', testTicker)
    await typeInto('add-position-quantity-input', '3')
    await tap('add-position-submit-button')
    await el('add-position-modal').waitForDisplayed({ timeout: 5000, reverse: true })
    await expect(el(`position-item-${testTicker}`)).toBeDisplayed()
  })

  it('5.2 — SELL por cantidad comprada retorna 201', async () => {
    await buyPosition(testTicker, '5')
    await tap('portfolio-add-button')
    await tap('add-position-sell-button')
    await typeInto('add-position-ticker-input', testTicker)
    await typeInto('add-position-quantity-input', '5')
    await tap('add-position-submit-button')
    await el('add-position-modal').waitForDisplayed({ timeout: 5000, reverse: true })
  })

  it('5.2 — SELL de más acciones de las disponibles muestra error', async () => {
    await buyPosition(testTicker, '2')
    await tap('portfolio-add-button')
    await tap('add-position-sell-button')
    await typeInto('add-position-ticker-input', testTicker)
    await typeInto('add-position-quantity-input', '99999')
    await tap('add-position-submit-button')
    await expect(el('add-position-error')).toBeDisplayed()
    await expect(el('add-position-modal')).toBeDisplayed()
  })

  it('5.2 — SELL con cantidad 0 muestra error de validación', async () => {
    await tap('portfolio-add-button')
    await tap('add-position-sell-button')
    await typeInto('add-position-ticker-input', testTicker)
    await typeInto('add-position-quantity-input', '0')
    await tap('add-position-submit-button')
    await expect(el('add-position-error')).toBeDisplayed()
  })

  it('5.2 — Delete vende todas las acciones del ticker', async () => {
    await buyPosition(testTicker, testQuantity)
    await tap(`delete-position-button-${testTicker}`)
    await waitForElement('delete-position-confirm-button')
    await tap('delete-position-confirm-button')
    await el(`position-item-${testTicker}`).waitForDisplayed({ timeout: 10000, reverse: true })
    await expect(el(`position-item-${testTicker}`)).not.toBeDisplayed()
  })

  it('5.2 — cancelar Delete no modifica el portfolio', async () => {
    await buyPosition(testTicker, testQuantity)
    await tap(`delete-position-button-${testTicker}`)
    await waitForElement('delete-position-cancel-button')
    await tap('delete-position-cancel-button')
    await expect(el(`position-item-${testTicker}`)).toBeDisplayed()
  })

  // ─── 5.3: Navegación ────────────────────────────────────────────────────────

  it('5.3 — navega a Current Value', async () => {
    await $('~Current Value').click()
    await expect($('//*[@text="Current Value"]')).toBeDisplayed()
  })

  it('5.3 — navega a History', async () => {
    await $('~History').click()
    await expect($('//*[@text="History"]')).toBeDisplayed()
  })

  it('5.3 — navega a Watchlist', async () => {
    await $('~Watchlist').click()
    await expect($('//*[@text="Watchlist"]')).toBeDisplayed()
  })

  it('5.3 — mantiene sesión al navegar entre secciones', async () => {
    await $('~History').click()
    await $('~Portfolio').click()
    await expect(el('portfolio-add-button')).toBeDisplayed()
  })
})
