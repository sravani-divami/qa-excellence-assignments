import { Page } from '@playwright/test';
import { NavbarComponent } from '../components/Navbar.component';
import { BasketSummaryComponent } from '../components/BasketSummary.component';
import { DeliveryOptionsComponent } from '../components/DeliveryOptions.component';
import { PromoCodeComponent } from '../components/PromoCode.component';
import { BillingAddressComponent } from '../components/BillingAddress.component';
import { PaymentDetailsComponent } from '../components/PaymentDetails.component';

/**
 * BasketPage — composes 6 components: navbar, basketSummary, deliveryOptions,
 * promoCode, billingAddress, paymentDetails.
 */
export class BasketPage {
  readonly navbar: NavbarComponent;
  readonly basketSummary: BasketSummaryComponent;
  readonly deliveryOptions: DeliveryOptionsComponent;
  readonly promoCode: PromoCodeComponent;
  readonly billingAddress: BillingAddressComponent;
  readonly paymentDetails: PaymentDetailsComponent;

  constructor(readonly page: Page) {
    this.navbar          = new NavbarComponent(page);
    this.basketSummary   = new BasketSummaryComponent(page);
    this.deliveryOptions = new DeliveryOptionsComponent(page);
    this.promoCode       = new PromoCodeComponent(page);
    this.billingAddress  = new BillingAddressComponent(page);
    this.paymentDetails  = new PaymentDetailsComponent(page);
  }

  async open(): Promise<void> {
    await this.page.goto('/basket');
    // Small grace period for basket JS to render items from localStorage
    await this.page.waitForTimeout(300);
  }

  async getTotal(): Promise<number> {
    return this.basketSummary.getTotal();
  }

  async emptyBasket(): Promise<void> {
    // emptyBasket() shows a confirm() dialog — accept it automatically
    this.page.once('dialog', (dialog) => dialog.accept().catch(() => {}));
    await this.page.evaluate(() => {
      const el = document.querySelector('a[onclick*="emptyBasket"]') as HTMLElement | null;
      if (el) { el.click(); return; }
      const link = Array.from(document.querySelectorAll('a')).find(a => /empty basket/i.test(a.textContent || '')) as HTMLElement | null;
      if (link) link.click();
    });
    // Wait for localStorage.clear() + getCartDetails() to render empty basket
    await this.page.waitForFunction(
      () => parseInt((document.getElementById('basketCount') as HTMLElement)?.textContent || '999', 10) === 0,
      { timeout: 5000 }
    ).catch(() => {});
    await this.page.waitForTimeout(300);
  }

  async applyPromoCode(code: string): Promise<void> {
    await this.promoCode.apply(code);
  }

  async deleteItem(name: string): Promise<void> {
    // removeItem() shows a confirm() dialog — accept it automatically
    this.page.once('dialog', (dialog) => dialog.accept().catch(() => {}));
    // Use evaluate to click the "Delete Item" link (Sweet Shop uses <a class="small">)
    // This triggers removeItem(id) which shows a confirm dialog and then removes from localStorage
    await this.page.evaluate((productName) => {
      const items = Array.from(document.querySelectorAll('#basketItems li, .list-group-item'));
      for (const item of items) {
        if ((item.textContent || '').toLowerCase().includes(productName.toLowerCase())) {
          const del = item.querySelector('a.small') as HTMLElement | null;
          if (del) { del.click(); return; }
          const links = Array.from(item.querySelectorAll('a'));
          const fallback = links.find(a => /delete|remove|×/i.test(a.textContent || '')) as HTMLElement | null;
          if (fallback) { fallback.click(); return; }
        }
      }
    }, name);
    // Wait for confirm dialog to be accepted + localStorage update + getCartDetails() to re-render
    await this.page.waitForTimeout(600);
  }
}
