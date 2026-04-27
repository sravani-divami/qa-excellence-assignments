// tc-004.spec.ts
// Covers: Cart page - add/remove, continue shopping, checkout
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { loginAs } from '../utils';

test.describe('Cart Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'standard_user', 'secret_sauce');
    const inventory = new InventoryPage(page);
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.openCart();
    await expect(page).toHaveURL(/cart/);
  });

  test('Cart displays added item', async ({ page }) => {
    const cart = new CartPage(page);
    expect(await cart.getItemCount()).toBeGreaterThan(0);
  });

  test('Remove item from cart', async ({ page }) => {
    const cart = new CartPage(page);
    const item = cart.getItem(0);
    await item.remove();
    expect(await cart.getItemCount()).toBe(0);
  });

  test('Continue shopping navigates to inventory', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.continueShopping();
    await expect(page).toHaveURL(/inventory/);
  });

  test('Checkout navigates to checkout step one', async ({ page }) => {
    const cart = new CartPage(page);
    await cart.checkout();
    await expect(page).toHaveURL(/checkout-step-one/);
  });
});
