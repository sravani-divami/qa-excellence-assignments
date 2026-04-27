// CheckoutCompletePage.ts
import { Page } from '@playwright/test';

export class CheckoutCompletePage {
  constructor(private page: Page) {}
  /**
   * Gets the confirmation message after checkout is complete.
   * @returns {Promise<string | null>} The confirmation text.
   * @example
   *   const confirmation = await checkoutCompletePage.getConfirmation();
   */
  async getConfirmation() {
    return this.page.locator('.complete-header').textContent();
  }

  /**
   * Clicks the back home button to return to the inventory page.
   * @returns {Promise<void>}
   * @example
   *   await checkoutCompletePage.backHome();
   */
  async backHome() {
    await this.page.locator('[data-test="back-to-products"]').click();
  }
}
