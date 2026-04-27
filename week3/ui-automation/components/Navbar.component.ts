import { Locator, Page } from '@playwright/test';

/**
 * Navbar — present on every page. Top-level navigation + brand logo + basket badge.
 */
export class NavbarComponent {
  readonly root: Locator;
  readonly brand: Locator;

  constructor(readonly page: Page) {
    this.root = page.locator('nav, .navbar').first();
    this.brand = this.root.locator('.navbar-brand');
  }

  async isVisible(): Promise<boolean> {
    return this.root.isVisible();
  }

  async getBrandText(): Promise<string> {
    return ((await this.brand.textContent()) || '').trim();
  }

  async clickBrand(): Promise<void> {
    await this.brand.click();
  }

  async clickNavLink(name: string): Promise<void> {
    await this.root.getByRole('link', { name: new RegExp(name, 'i') }).first().click();
  }

  async isNavLinkActive(name: string): Promise<boolean> {
    const link = this.root.getByRole('link', { name: new RegExp(name, 'i') }).first();
    // Wait briefly for custom.js to set the active class after navigation
    await this.page.waitForTimeout(300);
    // Sweet Shop puts 'active' on <a class="nav-link active"> — check both a and li
    const combined = await link.evaluate((el) => {
      const aCls = el.className || '';
      const liCls = el.closest('li')?.className || '';
      return aCls + ' ' + liCls;
    }).catch(() => '');
    return combined.includes('active');
  }

  async getBasketCount(): Promise<number> {
    const basketLink = this.root.getByRole('link', { name: /basket/i }).first();
    const badge = basketLink.locator('.badge, span').first();
    const txt = ((await badge.textContent()) || '').trim();
    const num = parseInt(txt.match(/\d+/)?.[0] || '0', 10);
    return Number.isNaN(num) ? 0 : num;
  }
}
