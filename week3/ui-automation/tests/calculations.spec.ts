import { test, expect } from '@playwright/test';
import { SweetsPage } from '../pages/SweetsPage';
import { BasketPage } from '../pages/BasketPage';
import { DeliveryOptionsComponent } from '../components/DeliveryOptions.component';
import { ALL_PRODUCTS } from '../testdata/test-data';
import { parsePriceText } from '../utils/test.utils';

/**
 * TC-053 to TC-069 — Price Calculations (v3.1 numbering)
 *
 * Verifies that the basket total is calculated correctly as items are
 * added/removed, with and without delivery charges, and the full catalogue
 * total (TC-084: all 16 products = £10.05).
 */
test.describe('Price Calculations', () => {

    let sweets: SweetsPage;
    let basket: BasketPage;

    test.beforeEach(async ({ page }) => {
        sweets = new SweetsPage(page);
        basket = new BasketPage(page);
    });

    // ── TC-080: single item total matches product price ───────────────────────
    test('TC-053 | basket total equals product price for a single item', async ({ page }) => {
        await sweets.open();
        const card       = sweets.card(0);
        const priceText  = await card.getPriceText();
        const cardPrice  = parsePriceText(priceText);
        await sweets.addToBasket(await card.getName());
        await basket.open();
        const total = await basket.basketSummary.getTotal();
        expect(total).toBeCloseTo(cardPrice, 2);
    });

    // ── TC-082: total increases with each item added ──────────────────────────
    test('TC-054 | adding a second item increases basket total', async ({ page }) => {
        await sweets.open();
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        await basket.open();
        const totalOne = await basket.basketSummary.getTotal();

        await sweets.open();
        await sweets.addToBasket(ALL_PRODUCTS[1]);
        await basket.open();
        const totalTwo = await basket.basketSummary.getTotal();

        expect(totalTwo).toBeGreaterThan(totalOne);
    });

    // ── TC-083: total updates when item deleted ───────────────────────────────
    test('TC-067 | deleting an item reduces the basket total', async ({ page }) => {
        await sweets.open();
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        await sweets.addToBasket(ALL_PRODUCTS[1]);
        await basket.open();
        const totalBefore = await basket.basketSummary.getTotal();
        await basket.deleteItem(ALL_PRODUCTS[0]);
        const totalAfter = await basket.basketSummary.getTotal();
        expect(totalAfter).toBeLessThan(totalBefore);
    });

    // ── TC-084: full catalogue totals £10.05 (Collect, no promo) ─────────────
    test('TC-057 | full catalogue total equals £10.05 with Collect delivery', async ({ page }) => {
        await sweets.open();
        await sweets.addMultipleToBasket(ALL_PRODUCTS);
        await basket.open();
        const total = await basket.basketSummary.getTotal();
        expect(total).toBeCloseTo(10.05, 2);
    });

    // ── TC-085: Standard Shipping adds £1.99 to full catalogue total ──────────
    test('TC-058 | Standard Shipping adds £1.99 to total', async ({ page }) => {
        await sweets.open();
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        await basket.open();
        const collectTotal   = await basket.basketSummary.getTotal();
        await basket.deliveryOptions.selectStandardShipping();
        const shippingTotal  = await basket.basketSummary.getTotal();
        expect(shippingTotal).toBeCloseTo(collectTotal + 1.99, 2);
    });

    // ── TC-090: total is 0 after empty basket ─────────────────────────────────
    test('TC-061 | basket total is £0.00 after Empty Basket', async ({ page }) => {
        await sweets.open();
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        await basket.open();
        await basket.emptyBasket();
        const total = await basket.basketSummary.getTotal();
        expect(total).toBeCloseTo(0, 2);
    });

    // ── TC-091: collect delivery does not add to total ────────────────────────
    test('TC-038 | Collect (FREE) delivery does not change total', async ({ page }) => {
        await sweets.open();
        await sweets.addToBasket(ALL_PRODUCTS[0]);
        await basket.open();
        const before = await basket.basketSummary.getTotal();
        await basket.deliveryOptions.selectCollect();
        const after  = await basket.basketSummary.getTotal();
        expect(after).toBeCloseTo(before, 2);
    });

    // ── TC-093: basket shows £0.00 when navigated to directly with no items ───
    test('TC-061 | empty basket page shows £0.00 total', async ({ page }) => {
        await basket.open();
        const total = await basket.basketSummary.getTotal();
        expect(total).toBeCloseTo(0, 2);
    });
});
