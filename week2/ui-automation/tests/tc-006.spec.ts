// tc-006.spec.ts
// Covers: Checkout step two - overview, finish, cancel
import { test, expect } from '@playwright/test';

import { CheckoutStepTwoPage } from '../pages/CheckoutStepTwoPage';
import { goToCheckoutStepTwo } from '../utils';



test.describe('Checkout Step Two', () => {
  test('Overview and finish order', async ({ page }) => {
    await goToCheckoutStepTwo(page);
    const checkout2 = new CheckoutStepTwoPage(page);
    await checkout2.finish();
    await expect(page).toHaveURL(/checkout-complete/);
  });

  test('Cancel returns to inventory', async ({ page }) => {
    await goToCheckoutStepTwo(page);
    const checkout2 = new CheckoutStepTwoPage(page);
    await checkout2.cancel();
    await expect(page).toHaveURL(/inventory/);
  });
});
