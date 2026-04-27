// ProductDetailsPage.ts
import { Page } from '@playwright/test';
import { ButtonElement } from '../elements/ButtonElement';

export class ProductDetailsPage {
  backButton: ButtonElement;
  constructor(private page: Page) {
    this.backButton = new ButtonElement(page, '[data-test="back-to-products"]');
  }
  /**
   * Adds the product to the cart from the product details page.
   * @returns {Promise<void>}
   * @example
   *   await productDetailsPage.addToCart();
   */
  async addToCart() {
    // On product details, there is only one add-to-cart button
    await this.page.locator('button[data-test^="add-to-cart"]').first().click();
  }

  /**
   * Removes the product from the cart from the product details page.
   * @returns {Promise<void>}
   * @example
   *   await productDetailsPage.removeFromCart();
   */
  async removeFromCart() {
    await this.page.locator('button[data-test^="remove"]').first().click();
  }

  /**
   * Clicks the back button to return to the products list.
   * @returns {Promise<void>}
   * @example
   *   await productDetailsPage.goBack();
   */
  async goBack() {
    await this.backButton.click();
  }
}
