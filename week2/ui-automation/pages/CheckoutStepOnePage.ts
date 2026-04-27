// CheckoutStepOnePage.ts
import { Page } from '@playwright/test';
import { InputGroup } from '../components/InputGroup';

export class CheckoutStepOnePage {
  inputGroup: InputGroup;
  constructor(private page: Page) {
    this.inputGroup = new InputGroup(page);
  }
  /**
   * Fills the checkout form with the provided information.
   * @param {string} first - First name.
   * @param {string} last - Last name.
   * @param {string} zip - Postal code.
   * @returns {Promise<void>}
   * @example
   *   await checkoutStepOnePage.fillForm('John', 'Doe', '12345');
   */
  async fillForm(first: string, last: string, zip: string) {
    await this.inputGroup.firstName.fill(first);
    await this.inputGroup.lastName.fill(last);
    await this.inputGroup.postalCode.fill(zip);
  }

  /**
   * Clicks the continue button to proceed to the next checkout step.
   * @returns {Promise<void>}
   * @example
   *   await checkoutStepOnePage.continue();
   */
  async continue() {
    await this.page.locator('[data-test="continue"]').click();
  }

  /**
   * Cancels the checkout and returns to the cart.
   * @returns {Promise<void>}
   * @example
   *   await checkoutStepOnePage.cancel();
   */
  async cancel() {
    await this.page.locator('[data-test="cancel"]').click();
  }
}
