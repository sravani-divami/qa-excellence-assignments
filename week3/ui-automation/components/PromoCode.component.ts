import { Locator, Page } from '@playwright/test';

/**
 * PromoCode component — input field + Redeem button on /basket.
 */
export class PromoCodeComponent {
  readonly input: Locator;
  readonly redeemBtn: Locator;

  constructor(readonly page: Page) {
    this.input = page.locator('input[id*="promo" i], input[name*="promo" i], input[placeholder*="promo" i]').first();
    this.redeemBtn = page.getByRole('button', { name: /redeem/i }).first();
  }

  async apply(code: string): Promise<void> {
    // Fill the promo input (Playwright's fill fires proper input/change events for jQuery)
    await this.input.fill(code);
    // Dispatch the form's submit event directly — this triggers custom.js's jQuery
    // submit handler (which calls e.preventDefault() and runs promo validation)
    // WITHOUT causing actual page navigation (dispatchEvent doesn't trigger requestSubmit)
    await this.page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Promo" i]') as HTMLElement | null;
      const form = input?.closest('form') as HTMLFormElement | null;
      if (form) {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      }
    });
    // Allow custom.js to complete validation and update the DOM (add/remove is-invalid)
    await this.page.waitForTimeout(500);
  }

  async getError(): Promise<string> {
    // Check if input has is-invalid class (added by custom.js submit handler)
    const inputClass = (await this.input.getAttribute('class').catch(() => '')) || '';
    if (inputClass.includes('is-invalid')) {
      const feedback = this.page.locator('.input-group .invalid-feedback, form .invalid-feedback').first();
      const txt = ((await feedback.textContent().catch(() => '')) || '').trim();
      if (txt.length > 0) return txt;
    }
    // Fallback: check computed style of invalid-feedback sibling
    const feedbackVisible = await this.page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Promo" i]');
      if (!input) return null;
      // Find sibling .invalid-feedback
      let sibling = input.nextElementSibling;
      while (sibling) {
        if (sibling.classList.contains('invalid-feedback')) {
          const style = window.getComputedStyle(sibling);
          if (style.display !== 'none' && style.visibility !== 'hidden') {
            return sibling.textContent?.trim() || '';
          }
          break;
        }
        sibling = sibling.nextElementSibling;
      }
      return null;
    });
    if (feedbackVisible && feedbackVisible.length > 0) return feedbackVisible;
    return '';
  }

  async hasError(): Promise<boolean> {
    const err = await this.getError();
    return err.length > 0;
  }
}
