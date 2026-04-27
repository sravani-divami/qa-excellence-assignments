import { Locator, Page } from '@playwright/test';
import { parsePriceText } from '../utils/test.utils';

/**
 * BasketSummary — summary panel on /basket showing item list, count badge, total.
 */
export class BasketSummaryComponent {
  readonly root: Locator;

  constructor(readonly page: Page) {
    this.root = page
      .locator('div')
      .filter({ has: page.locator('h4, h3, h2', { hasText: /your basket|basket/i }) })
      .first()
      .or(page.locator('.list-group').first());
  }

  async getItemCount(): Promise<number> {
    // Exclude the always-present "Total (GBP)" row which also contains £
    const items = this.page.locator('.list-group-item, .basket-item, li')
      .filter({ hasText: /£/ })
      .filter({ hasNotText: /total/i });
    return items.count();
  }

  async getCount(): Promise<number> {
    const badge = this.root.locator('.badge').first();
    const txt = ((await badge.textContent()) || '').trim();
    const n = parseInt(txt.match(/\d+/)?.[0] || '0', 10);
    return Number.isNaN(n) ? 0 : n;
  }

  async getItemByName(name: string): Promise<Locator | null> {
    const item = this.page
      .locator('.list-group-item, .basket-item, li')
      .filter({ hasText: new RegExp(name, 'i') })
      .first();
    return (await item.count()) > 0 ? item : null;
  }

  async getTotal(): Promise<number> {
    return parsePriceText(await this.getTotalText());
  }

  async getTotalText(): Promise<string> {
    // Scope to #basketItems to avoid matching outer container divs
    const totalRow = this.page
      .locator('#basketItems li, #basketItems .list-group-item')
      .filter({ hasText: /total/i })
      .last();
    if ((await totalRow.count()) > 0) {
      return ((await totalRow.textContent()) || '').trim();
    }
    // Fallback: any li.list-group-item with both "total" and "£"
    const fallback = this.page
      .locator('li.list-group-item')
      .filter({ hasText: /total/i })
      .filter({ hasText: /£/ })
      .last();
    if ((await fallback.count()) > 0) {
      return ((await fallback.textContent()) || '').trim();
    }
    const fb = this.page.locator('text=/Total.*£/i').last();
    return ((await fb.textContent().catch(() => '')) || '').trim();
  }

  async isEmpty(): Promise<boolean> {
    const productLines = await this.page
      .locator('#basketItems li, .list-group-item')
      .filter({ hasText: /£/ })
      .filter({ hasNotText: /total/i })
      .count();
    return productLines === 0;
  }
}
