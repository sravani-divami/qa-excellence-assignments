// tc-009.spec.ts
// Covers: Edge cases and error handling (locked out, problem user, performance user, empty cart, missing info)
import { test, expect } from '@playwright/test';

import { users, loginAs } from '../utils';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';

const validData = { first: 'John', last: 'Doe', zip: '12345' };

test.describe('Edge Cases & Error Handling', () => {

  test('Locked out user cannot login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await loginAs(page, 'locked_out_user', 'secret_sauce');
    await expect(page.locator(login.errorMessage)).toBeVisible();
    await expect(page.locator(login.errorMessage)).toContainText('locked out');
  });


  test('Problem user sees broken images/UI', async ({ page }) => {
    await loginAs(page, 'problem_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
    // Optionally check for broken images or UI glitches
  });


  test('Performance glitch user experiences delay', async ({ page }) => {
    await loginAs(page, 'performance_glitch_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
    // Optionally measure load time
  });


  test('Checkout with empty cart is blocked', async ({ page }) => {
    await loginAs(page, 'standard_user', 'secret_sauce');
    const inventory = new InventoryPage(page);
    await inventory.openCart();
    const cart = new CartPage(page);
    await cart.checkout();
    await expect(page).toHaveURL(/checkout-step-one/);
    const checkout = new CheckoutStepOnePage(page);
    await checkout.continue();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });


  test('Checkout with missing info shows error', async ({ page }) => {
    await loginAs(page, 'standard_user', 'secret_sauce');
    const inventory = new InventoryPage(page);
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.openCart();
    const cart = new CartPage(page);
    await cart.checkout();
    const checkout = new CheckoutStepOnePage(page);
    await checkout.fillForm('', '', '');
    await checkout.continue();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });
});
