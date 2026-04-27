// MenuComponent.ts
// UI component for the burger menu
import { Page } from '@playwright/test';

/**
 * UI component for the burger menu.
 */
export class MenuComponent {
  /**
   * Creates a MenuComponent instance.
   * @param {Page} page - Playwright Page object.
   * @example
   *   const menu = new MenuComponent(page);
   */
  constructor(private page: Page) {}

  /**
   * Opens the burger menu.
   * @returns {Promise<void>}
   * @example
   *   await menu.open();
   */
  async open() {
    await this.page.locator('#react-burger-menu-btn').click();
  }

  /**
   * Clicks the 'All Items' link in the menu.
   * @returns {Promise<void>}
   * @example
   *   await menu.clickAllItems();
   */
  async clickAllItems() {
    await this.page.locator('#inventory_sidebar_link').click();
  }

  /**
   * Clicks the 'About' link in the menu.
   * @returns {Promise<void>}
   * @example
   *   await menu.clickAbout();
   */
  async clickAbout() {
    await this.page.locator('#about_sidebar_link').click();
  }

  /**
   * Clicks the 'Logout' link in the menu.
   * @returns {Promise<void>}
   * @example
   *   await menu.clickLogout();
   */
  async clickLogout() {
    await this.page.locator('#logout_sidebar_link').click();
  }

  /**
   * Clicks the 'Reset App State' link in the menu.
   * @returns {Promise<void>}
   * @example
   *   await menu.clickResetAppState();
   */
  async clickResetAppState() {
    await this.page.locator('#reset_sidebar_link').click();
  }
}
