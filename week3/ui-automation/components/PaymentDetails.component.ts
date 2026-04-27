import { Page } from '@playwright/test';
import { FormField } from './FormField.component';
import { PaymentData } from '../testdata/test-data';

/**
 * PaymentDetails — the Payment form + Continue to checkout button on /basket.
 * HTML IDs: cc-name, cc-number, cc-expiration, cc-cvv
 */
export class PaymentDetailsComponent {
  readonly nameOnCard: FormField;
  readonly cardNumber: FormField;
  readonly expiration: FormField;
  readonly cvv: FormField;
  readonly continueToCheckout: FormField;

  constructor(readonly page: Page) {
    this.nameOnCard = new FormField(page, '#cc-name');
    this.cardNumber = new FormField(page, '#cc-number');
    this.expiration = new FormField(page, '#cc-expiration');
    this.cvv        = new FormField(page, '#cc-cvv');
    this.continueToCheckout = new FormField(
      page,
      page.getByRole('button', { name: /continue to checkout/i }),
      page.locator('xpath=//*[1=0]'),
    );
  }

  async fillAndSubmit(data: PaymentData): Promise<void> {
    await this.nameOnCard.set(data.nameOnCard);
    await this.cardNumber.set(data.cardNumber);
    await this.expiration.set(data.expiration);
    await this.cvv.set(data.cvv);
    await this.continueToCheckout.click();
  }
}
