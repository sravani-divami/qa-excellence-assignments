import { Page } from '@playwright/test';
import { NavbarComponent } from '../components/Navbar.component';
import { FormField } from '../components/FormField.component';

/**
 * LoginPage — /login. Email + Password + Login button.
 * KI-4: no real authentication.
 */
export class LoginPage {
  readonly navbar: NavbarComponent;
  readonly email: FormField;
  readonly password: FormField;
  readonly loginBtn: FormField;

  constructor(readonly page: Page) {
    this.navbar = new NavbarComponent(page);
    this.email = new FormField(page, '#exampleInputEmail');
    this.password = new FormField(page, '#exampleInputPassword');
    this.loginBtn = new FormField(
      page,
      page.getByRole('button', { name: /^log\s*in$|login|sign\s*in/i }),
      page.locator('xpath=//*[1=0]'),
    );
  }

  async open(): Promise<void> {
    await this.page.goto('/login');
  }

  async getHeading(): Promise<string> {
    const h = this.page.locator('h1, h2').first();
    return ((await h.textContent()) || '').trim();
  }

  async login(emailValue: string, passwordValue: string): Promise<void> {
    await this.email.set(emailValue);
    await this.password.set(passwordValue);
    await this.loginBtn.click();
  }
}
