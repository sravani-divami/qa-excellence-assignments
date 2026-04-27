import { Locator, Page } from '@playwright/test';

/**
 * FormField wraps an input element and the error message that appears
 * adjacent to it (Bootstrap's .invalid-feedback pattern, or a custom
 * sibling selector).
 *
 * Methods:
 *   raw         — the underlying Locator (use for visibility / class assertions)
 *   set(value)  — fill or select the value
 *   getError()  — read the inline error text (empty string if none)
 *   hasError()  — true if the field shows an error class or visible error
 *   getOptions()— for <select>: list of option text values
 *   isPasteDisabled() — true if the field has onpaste="return false"
 */
export class FormField {
  readonly raw: Locator;
  readonly errorLocator: Locator;

  constructor(
    readonly page: Page,
    inputSelector: string | Locator,
    errorSelector?: string | Locator,
  ) {
    this.raw = typeof inputSelector === 'string' ? page.locator(inputSelector) : inputSelector;
    if (errorSelector) {
      this.errorLocator = typeof errorSelector === 'string' ? page.locator(errorSelector) : errorSelector;
    } else {
      // Default: any sibling .invalid-feedback element relative to the input
      this.errorLocator = this.raw.locator('xpath=following-sibling::*[contains(@class,"invalid-feedback")][1]');
    }
  }

  async set(value: string): Promise<void> {
    const tagName = await this.raw.evaluate((el) => el.tagName.toLowerCase());
    if (tagName === 'select') {
      // Try by label first, fall back to value
      try {
        await this.raw.selectOption({ label: value });
      } catch {
        await this.raw.selectOption(value);
      }
    } else {
      await this.raw.fill(value);
    }
  }

  async getError(): Promise<string> {
    try {
      const count = await this.errorLocator.count();
      if (count === 0) return '';
      // Bootstrap shows the error via CSS rule .was-validated :invalid + .invalid-feedback,
      // but the element exists in DOM at all times — read its text either way.
      const text = (await this.errorLocator.first().textContent()) || '';
      return text.trim();
    } catch {
      return '';
    }
  }

  async hasError(): Promise<boolean> {
    // True if the element has the is-invalid class OR HTML5 reports invalid
    const classes = (await this.raw.getAttribute('class')) || '';
    if (classes.includes('is-invalid')) return true;
    try {
      const isInvalid = await this.raw.evaluate(
        (el: any) => (el.validity ? !el.validity.valid : false),
      );
      if (isInvalid) {
        // But only count as "has error" once form has been submitted
        const formIsValidated = await this.raw.evaluate((el) => {
          const form = (el as HTMLElement).closest('form');
          return form ? form.classList.contains('was-validated') : false;
        });
        if (formIsValidated) return true;
      }
    } catch {
      /* ignore */
    }
    return false;
  }

  async getOptions(): Promise<string[]> {
    return await this.raw.locator('option').allTextContents().then(arr =>
      arr
        .map(t => t.trim())
        .filter(t => t && !/choose/i.test(t)),
    );
  }

  async isPasteDisabled(): Promise<boolean> {
    const onpaste = await this.raw.getAttribute('onpaste');
    return !!(onpaste && /false/.test(onpaste));
  }

  async click(): Promise<void> {
    await this.raw.click();
  }
}
