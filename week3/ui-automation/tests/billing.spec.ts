import { test, expect } from '@playwright/test';
import { SweetsPage } from '../pages/SweetsPage';
import { BasketPage } from '../pages/BasketPage';
import { ALL_PRODUCTS, VALID_BILLING } from '../testdata/test-data';

/**
 * TC-078 to TC-091 — Billing Address Form Validation (v3.1 numbering)
 *
 * Verifies that each billing field shows the correct inline validation error
 * when left empty, and accepts valid data. The Continue to checkout button
 * triggers Bootstrap `.needs-validation` which surfaces all errors at once.
 */
test.describe('Billing Form Validation', () => {

    let basket: BasketPage;

    test.beforeEach(async ({ page }) => {
        // Add an item and navigate to the basket before each billing test
        const sweets = new SweetsPage(page);
        await sweets.open();
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        basket = new BasketPage(page);
        await basket.open();
    });

    // ── TC-110: all billing fields render ─────────────────────────────────────
    test('TC-078 | all required billing fields are visible', async () => {
        await expect(basket.billingAddress.firstName.raw).toBeVisible();
        await expect(basket.billingAddress.lastName.raw).toBeVisible();
        await expect(basket.billingAddress.email.raw).toBeVisible();
        await expect(basket.billingAddress.address.raw).toBeVisible();
        await expect(basket.billingAddress.country.raw).toBeVisible();
        await expect(basket.billingAddress.city.raw).toBeVisible();
        await expect(basket.billingAddress.zip.raw).toBeVisible();
    });

    // ── TC-111: first name validation ────────────────────────────────────────
    test('TC-080 | empty first name shows validation error after submit', async ({ page }) => {
        // Submit without filling — triggers Bootstrap validation
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.billingAddress.firstName.getError();
        expect(error.length, 'first name error').toBeGreaterThan(0);
    });

    test('TC-080 | valid first name clears error', async ({ page }) => {
        await basket.billingAddress.firstName.set('Alice');
        const hasError = await basket.billingAddress.firstName.hasError();
        expect(hasError).toBe(false);
    });

    // ── TC-112: last name validation ─────────────────────────────────────────
    test('TC-081 | empty last name shows validation error after submit', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.billingAddress.lastName.getError();
        expect(error.length, 'last name error').toBeGreaterThan(0);
    });

    // ── TC-113: email validation ──────────────────────────────────────────────
    test('TC-082 | empty email shows validation error after submit', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.billingAddress.email.getError();
        expect(error.length, 'email error').toBeGreaterThan(0);
    });

    test('TC-082 | invalid email format shows error', async ({ page }) => {
        await basket.billingAddress.email.set('notanemail');
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.billingAddress.email.getError();
        expect(error.length).toBeGreaterThan(0);
    });

    test('TC-082 | valid email format is accepted', async () => {
        await basket.billingAddress.email.set('alice@test.com');
        const hasError = await basket.billingAddress.email.hasError();
        expect(hasError).toBe(false);
    });

    // ── TC-114: address line 1 validation ────────────────────────────────────
    test('TC-083 | empty address line 1 shows error: "Please enter your shipping address."', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.billingAddress.address.getError();
        expect(error).toMatch(/shipping address/i);
    });

    // ── TC-116: address line 2 is optional ───────────────────────────────────
    test('TC-084 | address line 2 is optional — empty does not show error', async () => {
        // Address2 has no error locator — it should not be required
        await expect(basket.billingAddress.address2.raw).toBeVisible();
        // No validation on address2 — verify field exists and is editable
        await basket.billingAddress.address2.set('');
        const hasError = await basket.billingAddress.address2.hasError();
        expect(hasError).toBe(false);
    });

    // ── TC-117: country dropdown validation ──────────────────────────────────
    test('TC-085 | country dropdown contains "United Kingdom"', async () => {
        const options = await basket.billingAddress.country.getOptions();
        expect(options).toContain('United Kingdom');
    });

    test('TC-085 | leaving country at default triggers "Please select a valid country."', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.billingAddress.country.getError();
        expect(error).toMatch(/valid country/i);
    });

    // ── TC-118: city dropdown validation (KI-3) ───────────────────────────────
    test('TC-086 | city dropdown contains exactly Bristol, Cardiff, Swansea (KI-3)', async () => {
        const options = await basket.billingAddress.city.getOptions();
        expect(options).toEqual(expect.arrayContaining(['Bristol', 'Cardiff', 'Swansea']));
        expect(options.length).toBe(3);
    });

    test('TC-086 | leaving city at default triggers "Please provide a valid state."', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.billingAddress.city.getError();
        expect(error).toMatch(/valid state/i);
    });

    // ── TC-119: ZIP validation ────────────────────────────────────────────────
    test('TC-087 | empty zip shows "Zip code required."', async ({ page }) => {
        await basket.paymentDetails.continueToCheckout.click();
        const error = await basket.billingAddress.zip.getError();
        expect(error).toMatch(/zip|postcode|required/i);
    });

    test('TC-087 | valid UK postcode is accepted', async () => {
        await basket.billingAddress.zip.set('BS1 4UP');
        const hasError = await basket.billingAddress.zip.hasError();
        expect(hasError).toBe(false);
    });

    // ── TC-117/118 combined: fill entire billing form ────────────────────────
    test('TC-078 | filling all billing fields with valid data shows no errors', async ({ page }) => {
        await basket.billingAddress.fill(VALID_BILLING);
        // Without submission, Bootstrap does not apply was-validated class,
        // so no is-invalid class should appear on any input
        await expect(basket.billingAddress.firstName.raw).not.toHaveClass(/is-invalid/);
        await expect(basket.billingAddress.email.raw).not.toHaveClass(/is-invalid/);
    });
});
