// CartPage.ts
import { Page } from '@playwright/test';
import { CartItem } from '../components/CartItem';

export class CartPage {
  constructor(private page: Page) {}

  /**
   * Gets the number of items in the cart.
   * @returns {Promise<number>} The count of cart items.
   * @example
   *   const count = await cartPage.getItemCount();
   */
  async getItemCount() {
    return this.page.locator('.cart_item').count();
  }

  /**
   * Returns a CartItem instance for the given index.
   * @param {number} index - The zero-based index of the cart item.
   * @returns {CartItem} The CartItem object.
   * @example
   *   const item = cartPage.getItem(0);
   */
  getItem(index: number) {
    return new CartItem(this.page, index);
  }

  /**
   * Clicks the checkout button to proceed to checkout.
   * @returns {Promise<void>}
   * @example
   *   await cartPage.checkout();
   */
  async checkout() {
    await this.page.locator('[data-test="checkout"]').click();
  }

  /**
   * Clicks the continue shopping button to return to the inventory page.
   * @returns {Promise<void>}
   * @example
   *   await cartPage.continueShopping();
   */
  async continueShopping() {
    await this.page.locator('[data-test="continue-shopping"]').click();
  }
}
