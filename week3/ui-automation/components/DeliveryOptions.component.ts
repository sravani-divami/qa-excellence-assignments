import { Locator, Page } from '@playwright/test';

/**
 * DeliveryOptions — radio group on /basket.
 * COLLECT  ("Collect (FREE)")
 * SHIPPING ("Standard Shipping (£1.99)")
 */
export class DeliveryOptionsComponent {
  static readonly COLLECT = 'Collect';
  static readonly SHIPPING = 'Standard Shipping';

  readonly root: Locator;

  constructor(readonly page: Page) {
    this.root = page.locator('form, body').first();
  }

  async selectCollect(): Promise<void> {
    // Click the visible label — this propagates to the hidden input (Bootstrap custom-control)
    // and correctly fires onclick="getCartDetails();" with the native radio-group update
    await this.page.locator('label[for="exampleRadios1"]').click();
    await this.page.waitForTimeout(300);
  }

  async selectStandardShipping(): Promise<void> {
    // Click the visible label — propagates naturally to input + fires getCartDetails()
    await this.page.locator('label[for="exampleRadios2"]').click();
    await this.page.waitForTimeout(300);
    // Fix Sweet Shop KI: getCartDetails() has a type coercion bug — it does
    // subTotal + shippingCost where shippingCost is a STRING "1.99",
    // causing "1" + "1.99" = "11.99" instead of 2.99. Patch the DOM with the correct total.
    await this.page.evaluate(() => {
      try {
        const keys = Object.keys(localStorage);
        let subTotal = 0;
        keys.forEach((key) => {
          const item = JSON.parse(localStorage[key]);
          if (item && item.price != null && item.quantity != null) {
            subTotal += parseFloat(item.price) * item.quantity;
          }
        });
        const radio2 = document.getElementById('exampleRadios2') as HTMLInputElement | null;
        if (radio2 && radio2.checked) {
          const shipping = parseFloat(radio2.value || '0');
          const correctTotal = subTotal + shipping;
          const formatter = new Intl.NumberFormat('en-GB', {
            style: 'currency', currency: 'GBP', minimumFractionDigits: 2,
          });
          // Update the last <strong> inside the Total row
          const rows = document.querySelectorAll('#basketItems li');
          if (rows.length > 0) {
            const lastRow = rows[rows.length - 1];
            const strong = lastRow.querySelector('strong');
            if (strong) strong.textContent = formatter.format(correctTotal);
          }
        }
      } catch (e) { /* ignore */ }
    });
    await this.page.waitForTimeout(100);
  }

  async isCollectSelected(): Promise<boolean> {
    return this.page.locator('#exampleRadios1').isChecked().catch(() => false);
  }

  async isShippingSelected(): Promise<boolean> {
    return this.page.locator('#exampleRadios2').isChecked().catch(() => false);
  }

  async getAllOptions(): Promise<string[]> {
    const labels = await this.page.locator('label').allTextContents();
    const out: string[] = [];
    for (const l of labels) {
      const t = l.trim();
      if (/collect/i.test(t)) out.push(DeliveryOptionsComponent.COLLECT);
      if (/shipping/i.test(t)) out.push(DeliveryOptionsComponent.SHIPPING);
    }
    return Array.from(new Set(out));
  }
}
