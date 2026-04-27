// MenuPage.ts
import { Page } from '@playwright/test';
import { MenuComponent } from '../components/MenuComponent';

export class MenuPage {
  menu: MenuComponent;
  constructor(private page: Page) {
    this.menu = new MenuComponent(page);
  }
  /**
   * Opens the burger menu.
   * @returns {Promise<void>}
   * @example
   *   await menuPage.open();
   */
  async open() {
    await this.menu.open();
  }

  /**
   * Logs out the current user via the menu.
   * @returns {Promise<void>}
   * @example
   *   await menuPage.logout();
   */
  async logout() {
    await this.menu.clickLogout();
  }

  /**
   * Resets the app state via the menu.
   * @returns {Promise<void>}
   * @example
   *   await menuPage.resetAppState();
   */
  async resetAppState() {
    await this.menu.clickResetAppState();
  }

  /**
   * Navigates to the All Items page via the menu.
   * @returns {Promise<void>}
   * @example
   *   await menuPage.allItems();
   */
  async allItems() {
    await this.menu.clickAllItems();
  }

  /**
   * Navigates to the About page via the menu.
   * @returns {Promise<void>}
   * @example
   *   await menuPage.about();
   */
  async about() {
    await this.menu.clickAbout();
  }
}
