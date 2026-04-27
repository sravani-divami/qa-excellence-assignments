import { test, expect } from '@playwright/test';
import { SweetsPage } from '../pages/SweetsPage';
import { BasketPage } from '../pages/BasketPage';
import { DeliveryOptionsComponent } from '../components/DeliveryOptions.component';
import { ALL_PRODUCTS, PROMO_VALID, PROMO_INVALID } from '../testdata/test-data';

/**
 * TC-021 to TC-049 — Basket (v3.1 numbering)
 *
 * Covers:
 *  - Add to Basket (from Sweets page)
 *  - Basket summary (item list, count, total)
 *  - Empty Basket
 *  - Delivery options (Collect / Standard Shipping)
 *  - Promo codes (valid, invalid, empty)
 */
test.describe('Basket', () => {

    // ─── Add to Basket ────────────────────────────────────────────────────────
    test.describe('TC-021 to TC-025 | Add to Basket', () => {
        let sweets: SweetsPage;
        let basket: BasketPage;

        test.beforeEach(async ({ page }) => {
            sweets = new SweetsPage(page);
            basket = new BasketPage(page);
            await sweets.open();
        });

        test('TC-032 | adding one item from Sweets page shows it in the basket', async ({ page }) => {
            await sweets.addToBasket(ALL_PRODUCTS[0]);
            await basket.open();
            const item = await basket.basketSummary.getItemByName(ALL_PRODUCTS[0]);
            expect(item).not.toBeNull();
        });

        test('TC-032 | basket count badge equals items added', async () => {
            await sweets.addToBasket(ALL_PRODUCTS[0]);
            await sweets.addToBasket(ALL_PRODUCTS[1]);
            await basket.open();
            const count = await basket.basketSummary.getItemCount();
            expect(count).toBe(2);
        });

        test('TC-023 | navbar badge updates to correct count after adding items', async () => {
            await sweets.addToBasket(ALL_PRODUCTS[0]);
            await sweets.addToBasket(ALL_PRODUCTS[2]);
            const navCount = await sweets.getNavBasketCount();
            expect(navCount).toBe(2);
        });

        test('TC-025 | adding multiple items — all appear in basket summary', async () => {
            const toAdd = [ALL_PRODUCTS[0], ALL_PRODUCTS[1], ALL_PRODUCTS[2]];
            await sweets.addMultipleToBasket(toAdd);
            await basket.open();
            for (const name of toAdd) {
                const item = await basket.basketSummary.getItemByName(name);
                expect(item, `${name} should be in basket`).not.toBeNull();
            }
        });

        test('TC-033 | basket total is greater than zero after adding an item', async () => {
            await sweets.addToBasket(ALL_PRODUCTS[0]);
            await basket.open();
            const total = await basket.basketSummary.getTotal();
            expect(total).toBeGreaterThan(0);
        });
    });

    // ─── Basket Summary ───────────────────────────────────────────────────────
    test.describe('TC-031 to TC-033 | Basket Summary', () => {
        let basket: BasketPage;

        test.beforeEach(async ({ page }) => {
            const sweets = new SweetsPage(page);
            await sweets.open();
            await sweets.addToBasket(ALL_PRODUCTS[0]);
            await sweets.addToBasket(ALL_PRODUCTS[1]);
            basket = new BasketPage(page);
            await basket.open();
        });

        test('TC-032 | basket summary shows correct item count', async () => {
            const count = await basket.basketSummary.getItemCount();
            expect(count).toBe(2);
        });

        test('TC-032 | basket count badge matches item count', async () => {
            const badgeCount = await basket.basketSummary.getCount();
            const itemCount  = await basket.basketSummary.getItemCount();
            expect(badgeCount).toBe(itemCount);
        });

        test('TC-033 | basket total text contains £', async () => {
            const totalText = await basket.basketSummary.getTotalText();
            expect(totalText).toMatch(/£/);
        });

        test('TC-036 | deleting one item reduces count by 1', async () => {
            await basket.deleteItem(ALL_PRODUCTS[0]);
            const count = await basket.basketSummary.getItemCount();
            expect(count).toBe(1);
        });
    });

    // ─── Empty Basket ─────────────────────────────────────────────────────────
    test.describe('TC-036 TC-037 | Empty Basket', () => {
        let basket: BasketPage;

        test.beforeEach(async ({ page }) => {
            const sweets = new SweetsPage(page);
            await sweets.open();
            await sweets.addToBasket(ALL_PRODUCTS[0]);
            basket = new BasketPage(page);
            await basket.open();
        });

        test('TC-036 | Empty Basket clears all items', async () => {
            await basket.emptyBasket();
            const isEmpty = await basket.basketSummary.isEmpty();
            expect(isEmpty).toBe(true);
        });

        test('TC-036 | navbar basket count is 0 after empty basket', async () => {
            await basket.emptyBasket();
            const count = await basket.navbar.getBasketCount();
            expect(count).toBe(0);
        });
    });

    // ─── Delivery Options ─────────────────────────────────────────────────────
    test.describe('TC-038 to TC-041 | Delivery Options', () => {
        let basket: BasketPage;

        test.beforeEach(async ({ page }) => {
            const sweets = new SweetsPage(page);
            await sweets.open();
            await sweets.addToBasket(ALL_PRODUCTS[0]);
            basket = new BasketPage(page);
            await basket.open();
        });

        test('TC-038 | default delivery option is Collect (FREE)', async () => {
            const isCollect = await basket.deliveryOptions.isCollectSelected();
            expect(isCollect).toBe(true);
        });

        test('TC-039 | selecting Standard Shipping changes selected option', async () => {
            await basket.deliveryOptions.selectStandardShipping();
            const isShipping = await basket.deliveryOptions.isShippingSelected();
            expect(isShipping).toBe(true);
        });

        test('TC-039 | selecting Standard Shipping increases total by £1.99', async () => {
            const totalBefore = await basket.getTotal();
            await basket.deliveryOptions.selectStandardShipping();
            const totalAfter = await basket.getTotal();
            expect(totalAfter).toBeCloseTo(totalBefore + 1.99, 2);
        });

        test('TC-040 | switching back to Collect removes shipping charge', async () => {
            const totalBefore = await basket.getTotal();
            await basket.deliveryOptions.selectStandardShipping();
            await basket.deliveryOptions.selectCollect();
            const totalAfter = await basket.getTotal();
            expect(totalAfter).toBeCloseTo(totalBefore, 2);
        });

        test('TC-041 | delivery options list contains both options', async () => {
            const options = await basket.deliveryOptions.getAllOptions();
            expect(options).toContain(DeliveryOptionsComponent.COLLECT);
            expect(options).toContain(DeliveryOptionsComponent.SHIPPING);
        });
    });

    // ─── Promo Codes ──────────────────────────────────────────────────────────
    test.describe('TC-043 to TC-049 | Promo Codes', () => {
        let basket: BasketPage;

        test.beforeEach(async ({ page }) => {
            const sweets = new SweetsPage(page);
            await sweets.open();
            await sweets.addToBasket(ALL_PRODUCTS[0]);
            basket = new BasketPage(page);
            await basket.open();
        });

        // KI-6: Sweet Shop app has no promo code back-end — the Redeem button does not
        // add is-invalid to the input nor show any visible error for invalid/empty codes.
        test('TC-043 | invalid promo code shows error message', async () => {
            test.fail(); // KI-6: no server-side promo validation — app shows no error
            await basket.applyPromoCode(PROMO_INVALID);
            const hasError = await basket.promoCode.hasError();
            expect(hasError).toBe(true);
        });

        // KI-6: Same reason — empty code triggers no UI feedback in this app.
        test('TC-043 | empty promo code shows error message', async () => {
            test.fail(); // KI-6: no server-side promo validation — app shows no error
            await basket.applyPromoCode('');
            const hasError = await basket.promoCode.hasError();
            expect(hasError).toBe(true);
        });

        // KI-6: No error text appears because the app has no promo validation UI.
        test('TC-043 | error text contains expected validation message', async () => {
            test.fail(); // KI-6: no server-side promo validation — app shows no error
            await basket.applyPromoCode(PROMO_INVALID);
            const error = await basket.promoCode.getError();
            expect(error.toLowerCase()).toContain('promo');
        });

        test('TC-049 | valid promo code does not show error', async () => {
            await basket.applyPromoCode(PROMO_VALID);
            const hasError = await basket.promoCode.hasError();
            // Valid code should not show the invalid-feedback error
            expect(hasError).toBe(false);
        });

        // KI-6: Sweet Shop app has no promo code processing — total never changes.
        test('TC-049 | valid promo code reduces the basket total', async () => {
            test.fail(); // KI-6: no server-side promo processing — total stays the same
            const totalBefore = await basket.getTotal();
            await basket.applyPromoCode(PROMO_VALID);
            const totalAfter = await basket.getTotal();
            expect(totalAfter).toBeLessThan(totalBefore);
        });
    });
});
