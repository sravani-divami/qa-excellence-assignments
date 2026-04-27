// CartItem.ts
// UI component for a cart item row
import { Page, Locator } from '@playwright/test';

/**
 * UI component for a cart item row.
 */
export class CartItem {
  private locator: Locator;

  /**
   * Creates a CartItem instance for the given index.
   * @param {Page} page - Playwright Page object.
   * @param {number} index - Zero-based index of the cart item.
   * @example
   *   const item = new CartItem(page, 0);
   */
  constructor(page: Page, index: number) {
    this.locator = page.locator('.cart_item').nth(index);
  }

  /**
   * Gets the name of the cart item.
   * @returns {Promise<string | null>} The item name.
   * @example
   *   const name = await item.getName();
   */
  async getName() {
    return this.locator.locator('.inventory_item_name').textContent();
  }

  /**
   * Gets the price of the cart item.
   * @returns {Promise<string | null>} The item price.
   * @example
   *   const price = await item.getPrice();
   */
  async getPrice() {
    return this.locator.locator('.inventory_item_price').textContent();
  }

  /**
   * Removes the cart item by clicking the remove button.
   * @returns {Promise<void>}
   * @example
   *   await item.remove();
   */
  async remove() {
    await this.locator.locator('button[data-test^="remove-"]').click();
  }
}
