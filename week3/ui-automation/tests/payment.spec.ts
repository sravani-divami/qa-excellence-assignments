import { test, expect } from '@playwright/test';
import { SweetsPage } from '../pages/SweetsPage';
import { BasketPage } from '../pages/BasketPage';
import { ALL_PRODUCTS, VALID_BILLING, VALID_PAYMENT } from '../testdata/test-data';

/**
 * TC-092 to TC-119 — Payment Form + Checkout (v3.1 numbering)
 *
 * Verifies:
 *  - All 4 payment fields are present (TC-130)
 *  - Each field rejects empty input with the correct error (TC-131 to TC-134)
 *  - Continue to checkout triggers all 11 errors when forms are empty (TC-140)
 *  - Valid data produces no JS errors and no network requests (TC-141)
 *  - URL stays on /basket after failed validation (TC-146)
 */
test.describe('Payment Form & Checkout', () => {

    let basket: BasketPage;

    test.beforeEach(async ({ page }) => {
        const sweets = new SweetsPage(page);
        await sweets.open();
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        basket = new BasketPage(page);
        await basket.open();
    });

    // ── TC-130: all 4 payment fields render ───────────────────────────────────
    test('TC-092 | all 4 payment fields are visible', async () => {
        await expect(basket.paymentDetails.nameOnCard.raw).toBeVisible();
        await expect(basket.paymentDetails.cardNumber.raw).toBeVisible();
        await expect(basket.paymentDetails.expiration.raw).toBeVisible();
        await expect(basket.paymentDetails.cvv.raw).toBeVisible();
    });

    test('TC-092 | Continue to checkout button is visible', async () => {
        await expect(basket.paymentDetails.continueToCheckout.raw).toBeVisible();
    });

    // ── TC-131: name on card validation ───────────────────────────────────────
    test('TC-093 | empty name on card shows "Name on card is required"', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.paymentDetails.nameOnCard.getError();
        expect(error).toMatch(/name on card is required/i);
    });

    test('TC-093 | valid name on card is accepted', async () => {
        await basket.paymentDetails.nameOnCard.set('Alice Brown');
        const hasError = await basket.paymentDetails.nameOnCard.hasError();
        expect(hasError).toBe(false);
    });

    // ── TC-132: card number validation ────────────────────────────────────────
    test('TC-094 | empty card number shows "Credit card number is required"', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.paymentDetails.cardNumber.getError();
        expect(error).toMatch(/credit card number is required/i);
    });

    test('TC-094 | valid Luhn-passing card number is accepted', async () => {
        await basket.paymentDetails.cardNumber.set('4111111111111111');
        const hasError = await basket.paymentDetails.cardNumber.hasError();
        expect(hasError).toBe(false);
    });

    // ── TC-133: expiration validation ─────────────────────────────────────────
    test('TC-095 | empty expiration shows "Expiration date required"', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.paymentDetails.expiration.getError();
        expect(error).toMatch(/expiration date required/i);
    });

    test('TC-095 | future expiration date is accepted', async () => {
        await basket.paymentDetails.expiration.set('12/2030');
        const hasError = await basket.paymentDetails.expiration.hasError();
        expect(hasError).toBe(false);
    });

    // ── TC-134: CVV validation ────────────────────────────────────────────────
    test('TC-096 | empty CVV shows "Security code required"', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.paymentDetails.cvv.getError();
        expect(error).toMatch(/security code required/i);
    });

    test('TC-096 | 3-digit CVV is accepted', async () => {
        await basket.paymentDetails.cvv.set('123');
        const hasError = await basket.paymentDetails.cvv.hasError();
        expect(hasError).toBe(false);
    });

    test('TC-096 | 4-digit CVV (AmEx) is accepted', async () => {
        await basket.paymentDetails.cvv.set('1234');
        const hasError = await basket.paymentDetails.cvv.hasError();
        expect(hasError).toBe(false);
    });

    // ── TC-140: all 11 errors fire on submit with empty forms ─────────────────
    test('TC-101 | clicking Continue with all forms empty shows billing + payment errors', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();

        // Billing errors (7 fields)
        const firstNameErr  = await basket.billingAddress.firstName.getError();
        const lastNameErr   = await basket.billingAddress.lastName.getError();
        const emailErr      = await basket.billingAddress.email.getError();
        const addressErr    = await basket.billingAddress.address.getError();
        const countryErr    = await basket.billingAddress.country.getError();
        const cityErr       = await basket.billingAddress.city.getError();
        const zipErr        = await basket.billingAddress.zip.getError();

        // Payment errors (4 fields)
        const nameCardErr   = await basket.paymentDetails.nameOnCard.getError();
        const cardNumErr    = await basket.paymentDetails.cardNumber.getError();
        const expiryErr     = await basket.paymentDetails.expiration.getError();
        const cvvErr        = await basket.paymentDetails.cvv.getError();

        const allErrors = [
            firstNameErr, lastNameErr, emailErr, addressErr,
            countryErr, cityErr, zipErr,
            nameCardErr, cardNumErr, expiryErr, cvvErr,
        ];
        const triggeredErrors = allErrors.filter(e => e.length > 0);
        expect(triggeredErrors.length).toBe(11);
    });

    // ── TC-141: happy path — valid data, no JS errors ─────────────────────────
    test('TC-102 | valid data produces no console errors', async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', msg => {
            if (msg.type() === 'error') consoleErrors.push(msg.text());
        });

        await basket.billingAddress.fill(VALID_BILLING);
        await basket.paymentDetails.fillAndSubmit(VALID_PAYMENT);

        expect(consoleErrors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });

    test('TC-102 | Continue to checkout generates zero network requests with card data (KI-5)', async ({ page }) => {
        const networkRequests: string[] = [];
        page.on('request', req => networkRequests.push(req.url()));

        const requestsBefore = networkRequests.length;
        await basket.billingAddress.fill(VALID_BILLING);
        await basket.paymentDetails.fillAndSubmit(VALID_PAYMENT);
        const requestsAfter = networkRequests.length;

        // KI-5: no real backend — no requests should fire containing card data
        const cardDataRequests = networkRequests
            .slice(requestsBefore)
            .filter(url => url.includes('4111') || url.includes('checkout') || url.includes('pay'));
        expect(cardDataRequests).toHaveLength(0);
    });

    // ── TC-143: error messages placed adjacent to fields ─────────────────────
    test('TC-104 | validation errors are visible after submit attempt', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        // Verify at least one error is rendered and visible
        const firstNameError = await basket.billingAddress.firstName.getError();
        expect(firstNameError.length).toBeGreaterThan(0);
    });

    // ── TC-146: URL stays on /basket after failed validation ──────────────────
    test('TC-107 | URL remains /basket after failed validation attempt', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        await expect(page).toHaveURL(/\/basket/);
    });

    // ── TC-170 (negative flow): direct URL to /basket with empty basket ───────
    test('TC-119 | directly navigating to /basket with no items loads page successfully', async ({ page }) => {
        // Navigate directly without adding items
        await page.goto('/basket');
        await expect(page).toHaveURL(/\/basket/);
        // Forms should still be present
        await expect(basket.billingAddress.firstName.raw).toBeVisible();
        await expect(basket.paymentDetails.nameOnCard.raw).toBeVisible();
    });
});
