// tc-003.spec.ts
// Covers: Product details page - add/remove cart, back navigation
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { ProductDetailsPage } from '../pages/ProductDetailsPage';
import { loginAs } from '../utils';

test.describe('Product Details Page', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'standard_user', 'secret_sauce');
    await expect(page).toHaveURL(/inventory/);
    await page.locator('.inventory_item_name', { hasText: 'Sauce Labs Backpack' }).click();
    await expect(page).toHaveURL(/inventory-item/);
  });

  test('Add to cart and remove from cart', async ({ page }) => {
    const details = new ProductDetailsPage(page);
    await details.addToCart();
    await details.removeFromCart();
  });

  test('Back to products navigates to inventory', async ({ page }) => {
    const details = new ProductDetailsPage(page);
    await details.goBack();
    await expect(page).toHaveURL(/inventory/);
  });
});
