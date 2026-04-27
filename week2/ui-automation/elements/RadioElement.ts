// RadioElement.ts
// Generic radio button element wrapper for Playwright
import { Locator, Page } from '@playwright/test';

export class RadioElement {
  private locator: Locator;
  constructor(page: Page, selector: string) {
    this.locator = page.locator(selector);
  }
  
  /**
   * Checks (selects) the radio button.
   * @returns {Promise<void>} Resolves when the radio button is checked.
   * @example
   *   await radioElement.check();
   */
  async check() {
    await this.locator.check();
  }

  /**
   * Checks if the radio button is currently selected.
   * @returns {Promise<boolean>} True if checked, false otherwise.
   * @example
   *   const checked = await radioElement.isChecked();
   */
  async isChecked() {
    return this.locator.isChecked();
  }

  /**
   * Checks if the radio button is visible on the page.
   * @returns {Promise<boolean>} True if visible, false otherwise.
   * @example
   *   const visible = await radioElement.isVisible();
   */
  async isVisible() {
    return this.locator.isVisible();
  }
}
