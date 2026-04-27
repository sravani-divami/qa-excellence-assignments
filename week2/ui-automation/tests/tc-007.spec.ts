// tc-007.spec.ts
// Covers: Checkout complete page - confirmation, back home
import { test, expect } from '@playwright/test';

import { CheckoutCompletePage } from '../pages/CheckoutCompletePage';
import { goToCheckoutComplete } from '../utils';



test.describe('Checkout Complete Page', () => {
  test('Order confirmation message is shown', async ({ page }) => {
    await goToCheckoutComplete(page);
    const complete = new CheckoutCompletePage(page);
    await expect(await complete.getConfirmation()).toContain('Thank you for your order');
  });

  test('Back Home returns to inventory', async ({ page }) => {
    await goToCheckoutComplete(page);
    const complete = new CheckoutCompletePage(page);
    await complete.backHome();
    await expect(page).toHaveURL(/inventory/);
  });
});
