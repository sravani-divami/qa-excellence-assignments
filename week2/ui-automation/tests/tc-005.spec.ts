// tc-005.spec.ts
// Covers: Checkout step one - form validation, continue, cancel
import { test, expect } from '@playwright/test';

import { CheckoutStepOnePage } from '../pages/CheckoutStepOnePage';
import { goToCheckoutStepOne } from '../utils';

const validData = { first: 'John', last: 'Doe', zip: '12345' };



test.describe('Checkout Step One', () => {
  test('Form validation: missing fields', async ({ page }) => {
    await goToCheckoutStepOne(page);
    const checkout = new CheckoutStepOnePage(page);
    await checkout.fillForm('', '', '');
    await checkout.continue();
    await expect(page.locator('[data-test="error"]')).toBeVisible();
  });

  test('Continue with valid data', async ({ page }) => {
    await goToCheckoutStepOne(page);
    const checkout = new CheckoutStepOnePage(page);
    await checkout.fillForm(validData.first, validData.last, validData.zip);
    await checkout.continue();
    await expect(page).toHaveURL(/checkout-step-two/);
  });

  test('Cancel returns to cart', async ({ page }) => {
    await goToCheckoutStepOne(page);
    const checkout = new CheckoutStepOnePage(page);
    await checkout.cancel();
    await expect(page).toHaveURL(/cart/);
  });
});
