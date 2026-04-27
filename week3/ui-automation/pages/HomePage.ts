import { Locator, Page } from '@playwright/test';
import { NavbarComponent } from '../components/Navbar.component';

/**
 * Wrapper for a "Most Popular" product card on the Home page.
 * Sweet Shop renders: <a class="btn btn-success btn-block addItem">Add to Basket</a>
 */
export class PopularCard {
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

  async clickAddToBasket(): Promise<void> {
    // Sweet Shop uses <a class="addItem"> not <button>
    await this.card.locator('a.addItem').first().click();
  }
}

/**
 * HomePage — the landing page at /
 */
export class HomePage {
  readonly navbar: NavbarComponent;

  constructor(readonly page: Page) {
    this.navbar = new NavbarComponent(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/');
  }

  async getHeading(): Promise<string> {
    const h = this.page.locator('h1, h2').first();
    return ((await h.textContent()) || '').trim();
  }

  async getPopularCards(): Promise<Locator[]> {
    const cards = this.page.locator('.card');
    const count = await cards.count();
    const out: Locator[] = [];
    for (let i = 0; i < count; i++) out.push(cards.nth(i));
    return out;
  }

  popularCard(index: number): PopularCard {
    return new PopularCard(this.page.locator('.card').nth(index));
  }

  async clickBrowseSweets(): Promise<void> {
    await this.page.getByRole('link', { name: /browse sweets/i })
      .or(this.page.getByRole('button', { name: /browse sweets/i }))
      .first()
      .click();
  }
}
