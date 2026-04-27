// InventoryPage.ts
import { Page } from '@playwright/test';
import { ButtonElement } from '../elements/ButtonElement';
import { MenuComponent } from '../components/MenuComponent';

export class InventoryPage {
  menu: MenuComponent;
  cartIcon: string;
  sortDropdown: string;

  constructor(private page: Page) {
    this.menu = new MenuComponent(page);
    this.cartIcon = '.shopping_cart_link';
    this.sortDropdown = '[data-test="product_sort_container"]';
  }

  /**
   * Adds a product to the cart by its name.
   * @param {string} productName - The name of the product to add.
   * @returns {Promise<void>}
   * @example
   *   await inventoryPage.addToCartByName('Sauce Labs Backpack');
   */
  async addToCartByName(productName: string) {
    // Find the inventory item container by product name, then click its add-to-cart button
    const item = this.page.locator('.inventory_item').filter({ has: this.page.locator('.inventory_item_name', { hasText: productName }) });
    await item.locator('button[data-test^="add-to-cart-"]').click();
  }

  /**
   * Opens the cart page by clicking the cart icon.
   * @returns {Promise<void>}
   * @example
   *   await inventoryPage.openCart();
   */
  async openCart() {
    await this.page.locator(this.cartIcon).click();
  }

  /**
   * Sorts the inventory items by the given option.
   * @param {string} option - The sort option value.
   * @returns {Promise<void>}
   * @example
   *   await inventoryPage.sortBy('za');
   */
  async sortBy(option: string) {
    // Wait for navigation to inventory page if not already there
    if (!this.page.url().includes('/inventory')) {
      await this.page.waitForURL('**/inventory');
    }
    // Wait for inventory items to ensure page is loaded
    await this.page.locator('.inventory_item').first().waitFor({ state: 'visible' });
    // Now wait for and interact with the dropdown
    const dropdown = this.page.locator(this.sortDropdown);
    await dropdown.waitFor({ state: 'visible', timeout: 10000 });
    await dropdown.selectOption(option);
    // Wait for the sort to complete by waiting for the inventory to stabilize
    await this.page.waitForTimeout(500);
  }
}
