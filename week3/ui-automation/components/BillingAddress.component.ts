import { Page } from '@playwright/test';
import { FormField } from './FormField.component';
import { BillingData } from '../testdata/test-data';

/**
 * BillingAddress — the Billing form on /basket.
 * Actual HTML IDs: firstName/lastName both use id="name" (app bug),
 * email=#email, address=#address, address2=#address2, country=#country,
 * city=#city, zip=#zip.
 */
export class BillingAddressComponent {
  readonly firstName: FormField;
  readonly lastName: FormField;
  readonly email: FormField;
  readonly address: FormField;
  readonly address2: FormField;
  readonly country: FormField;
  readonly city: FormField;
  readonly zip: FormField;

  constructor(readonly page: Page) {
    const form = page.locator('form.needs-validation');
    const nameInputs = form.locator('#name');
    // Both first/last name use id="name" (app bug) — disambiguate by index
    this.firstName = new FormField(page, nameInputs.nth(0));
    this.lastName  = new FormField(page, nameInputs.nth(1));
    this.email     = new FormField(page, '#email');
    this.address   = new FormField(page, '#address');
    this.address2  = new FormField(page, '#address2');
    this.country   = new FormField(page, '#country');
    // City select uses id="city" (label says "City", for="state" is a typo in the app)
    this.city      = new FormField(page, '#city');
    this.zip       = new FormField(page, '#zip');
  }

  async fill(data: BillingData): Promise<void> {
    await this.firstName.set(data.firstName);
    await this.lastName.set(data.lastName);
    await this.email.set(data.email);
    await this.address.set(data.address);
    if (data.address2) await this.address2.set(data.address2);
    await this.country.set(data.country);
    await this.city.set(data.city);
    await this.zip.set(data.zip);
  }
}
