// CheckoutStepTwoPage.ts
import { Page } from '@playwright/test';

export class CheckoutStepTwoPage {
  constructor(private page: Page) {}
  /**
   * Clicks the finish button to complete the checkout process.
   * @returns {Promise<void>}
   * @example
   *   await checkoutStepTwoPage.finish();
   */
  async finish() {
    await this.page.locator('[data-test="finish"]').click();
  }

  /**
   * Cancels the checkout and returns to the cart.
   * @returns {Promise<void>}
   * @example
   *   await checkoutStepTwoPage.cancel();
   */
  async cancel() {
    await this.page.locator('[data-test="cancel"]').click();
  }

  /**
   * Gets the summary information for the checkout.
   * @returns {Promise<string | null>} The summary text.
   * @example
   *   const summary = await checkoutStepTwoPage.getSummary();
   */
  async getSummary() {
    return this.page.locator('.summary_info').textContent();
  }
}
