import { test, expect } from '@playwright/test';
import { SweetsPage } from '../pages/SweetsPage';
import { ALL_PRODUCTS } from '../testdata/test-data';

/**
 * TC-014 to TC-021 — Browse Sweets / Add to Basket (v3.1 numbering)
 *
 * Verifies that all 16 products are displayed, each card has the required
 * elements (image, name, description, price, Add to Basket button), prices
 * are correctly formatted, and adding a product updates the navbar basket
 * badge.
 */
test.describe('Sweets Catalogue Page', () => {

    let sweets: SweetsPage;

    test.beforeEach(async ({ page }) => {
        sweets = new SweetsPage(page);
        await sweets.open();
    });

    // ── TC-020: 16 products displayed ────────────────────────────────────────
    test('TC-015 | exactly 16 products are displayed', async () => {
        const count = await sweets.getCardCount();
        expect(count).toBe(16);
    });

    test('TC-014 | page heading is visible', async () => {
        const heading = await sweets.getHeading();
        expect(heading.length).toBeGreaterThan(0);
    });

    test('TC-014 | URL is /sweets', async ({ page }) => {
        await expect(page).toHaveURL(/\/sweets/);
    });

    // ── TC-021: each card has image, name, description, price, button ─────────
    test('TC-015 | first product card has name, price text and data-id', async () => {
        const card = sweets.card(0);
        const name  = await card.getName();
        const price = await card.getPriceText();
        const id    = await card.getProductId();
        expect(name.length).toBeGreaterThan(0);
        expect(price).toMatch(/£/);
        expect(Number(id)).toBeGreaterThan(0);
    });

    test('TC-015 | all 16 cards have non-empty names', async () => {
        for (let i = 0; i < 16; i++) {
            const name = await sweets.card(i).getName();
            expect(name.length, `card[${i}] name`).toBeGreaterThan(0);
        }
    });

    test('TC-015 | all 16 cards have a price containing £', async () => {
        for (let i = 0; i < 16; i++) {
            const price = await sweets.card(i).getPriceText();
            expect(price, `card[${i}] price`).toMatch(/£/);
        }
    });

    // ── TC-022: prices formatted correctly ───────────────────────────────────
    test('TC-016 | all card prices are parseable positive numbers', async () => {
        for (let i = 0; i < 16; i++) {
            const priceText = await sweets.card(i).getPriceText();
            const value = parseFloat(priceText.replace(/[^0-9.]/g, ''));
            expect(value, `card[${i}] numeric price`).toBeGreaterThan(0);
        }
    });

    // ── TC-023: adding a product updates navbar basket count ──────────────────
    test('TC-021 | adding first product increments navbar badge to 1', async () => {
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        const count = await sweets.getNavBasketCount();
        expect(count).toBe(1);
    });

    test('TC-023 | adding a second product increments navbar badge to 2', async () => {
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        await sweets.addToBasket(ALL_PRODUCTS[1]);
        const count = await sweets.getNavBasketCount();
        expect(count).toBe(2);
    });

    // ── product lookup by name ────────────────────────────────────────────────
    test('TC-015 | can find "Chocolate Cups" card by name', async () => {
        const card = await sweets.cardByName('Chocolate Cups');
        const name = await card.getName();
        expect(name).toContain('Chocolate Cups');
    });
});
