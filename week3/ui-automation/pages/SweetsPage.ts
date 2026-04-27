import { Locator, Page } from '@playwright/test';
import { NavbarComponent } from '../components/Navbar.component';

/**
 * Wrapper for one product card on /sweets.
 * Sweet Shop renders: <a class="btn btn-success btn-block addItem" data-name="...">Add to Basket</a>
 */
export class ProductCard {
  constructor(private readonly card: Locator) {}

  async getName(): Promise<string> {
    const h = this.card.locator('h2, h3, h4, h5').first();
    return ((await h.textContent()) || '').trim();
  }

  async getPriceText(): Promise<string> {
    const priceEl = this.card.locator('text=/£\\d/').first();
    if ((await priceEl.count()) > 0) {
      return ((await priceEl.textContent()) || '').trim();
    }
    return ((await this.card.textContent()) || '').trim();
  }

  async getProductId(): Promise<string> {
    return (
      (await this.card.getAttribute('data-id')) ||
      (await this.card.locator('[data-id]').first().getAttribute('data-id')) ||
      ''
    );
  }

  async clickAddToBasket(): Promise<void> {
    // Sweet Shop uses <a class="addItem"> not <button>
    await this.card.locator('a.addItem').first().click();
  }
}

/**
 * SweetsPage — the catalogue at /sweets with 16 products.
 */
export class SweetsPage {
  readonly navbar: NavbarComponent;

  constructor(readonly page: Page) {
    this.navbar = new NavbarComponent(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/sweets');
  }

  async getHeading(): Promise<string> {
    const h = this.page.locator('h1, h2').first();
    return ((await h.textContent()) || '').trim();
  }

  private cards(): Locator {
    return this.page.locator('.card');
  }

  async getCardCount(): Promise<number> {
    return this.cards().count();
  }

  card(index: number): ProductCard {
    return new ProductCard(this.cards().nth(index));
  }

  async cardByName(name: string): Promise<ProductCard> {
    // Try matching by data-name attribute first (most reliable, bypasses title/data-name mismatches)
    const byDataName = this.page.locator('.card').filter({
      has: this.page.locator(`a.addItem[data-name="${name}"]`),
    }).first();
    if ((await byDataName.count()) > 0) return new ProductCard(byDataName);
    // Fallback: match by visible card text (h4/h5 title)
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const byText = this.cards().filter({
      has: this.page.locator(`text=/${escaped}/i`),
    }).first();
    return new ProductCard(byText);
  }

  async addToBasket(name: string): Promise<void> {
    const card = await this.cardByName(name);
    await card.clickAddToBasket();
    // Brief wait for the jQuery click handler to update localStorage
    await this.page.waitForTimeout(300);
  }

  async addMultipleToBasket(names: string[]): Promise<void> {
    for (const n of names) await this.addToBasket(n);
  }

  async getNavBasketCount(): Promise<number> {
    return this.navbar.getBasketCount();
  }
}
