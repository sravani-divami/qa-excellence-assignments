// LoginPage.ts
import { Page } from '@playwright/test';
import { TextElement } from '../elements/TextElement';
import { ButtonElement } from '../elements/ButtonElement';

export class LoginPage {
  username: TextElement;
  password: TextElement;
  loginButton: ButtonElement;
  errorMessage: string;

  constructor(private page: Page) {
    this.username = new TextElement(page, '[data-test="username"]');
    this.password = new TextElement(page, '[data-test="password"]');
    this.loginButton = new ButtonElement(page, '[data-test="login-button"]');
    this.errorMessage = '[data-test="error"]';
  }

  /**
   * Navigates to the login page (root URL).
   * @returns {Promise<void>}
   * @example
   *   await loginPage.goto();
   */
  async goto() {
    // Use Playwright's baseURL if set, else fallback
    await this.page.goto('/');
  }

  /**
   * Fills in the username and password fields and clicks the login button.
   * @param {string} user - The username.
   * @param {string} pass - The password.
   * @returns {Promise<void>}
   * @example
   *   await loginPage.login('standard_user', 'secret_sauce');
   */
  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }

  /**
   * Gets the error message text if login fails.
   * @returns {Promise<string | null>} The error message text.
   * @example
   *   const error = await loginPage.getError();
   */
  async getError() {
    return this.page.locator(this.errorMessage).textContent();
  }
}
