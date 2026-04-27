// TextElement.ts
// Generic text input element wrapper for Playwright
import { Locator, Page } from '@playwright/test';

export class TextElement {
  private locator: Locator;
  constructor(page: Page, selector: string) {
    this.locator = page.locator(selector);
  }
  /**
   * Fills the text input with the specified value.
   * @param {string} value - The value to enter into the input.
   * @returns {Promise<void>} Resolves when the input is filled.
   * @example
   *   await textElement.fill('example');
   */
  async fill(value: string) {
    await this.locator.fill(value);
  }

  /**
   * Clears the text input field.
   * @returns {Promise<void>} Resolves when the input is cleared.
   * @example
   *   await textElement.clear();
   */
  async clear() {
    await this.locator.fill('');
  }

  /**
   * Gets the current value of the text input.
   * @returns {Promise<string>} The value of the input field.
   * @example
   *   const value = await textElement.getValue();
   */
  async getValue() {
    return this.locator.inputValue();
  }

  /**
   * Checks if the text input is visible on the page.
   * @returns {Promise<boolean>} True if visible, false otherwise.
   * @example
   *   const visible = await textElement.isVisible();
   */
  async isVisible() {
    return this.locator.isVisible();
  }
}
