// ButtonElement.ts
// Generic button element wrapper for Playwright
import { Locator, Page } from '@playwright/test';

export class ButtonElement {
  private locator: Locator;
  constructor(page: Page, selector: string) {
    this.locator = page.locator(selector);
  }
  /**
   * Clicks the button represented by this element.
   * @returns {Promise<void>} Resolves when the click action is complete.
   * @example
   *   await buttonElement.click();
   */
  async click() {
    await this.locator.click();
  }

  /**
   * Checks if the button is visible on the page.
   * @returns {Promise<boolean>} True if visible, false otherwise.
   * @example
   *   const visible = await buttonElement.isVisible();
   */
  async isVisible() {
    return this.locator.isVisible();
  }
}
