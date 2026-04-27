// InputGroup.ts
// UI component for grouped input fields (e.g., checkout form)
import { Page } from '@playwright/test';
import { TextElement } from '../elements/TextElement';

/**
 * UI component for grouped input fields (e.g., checkout form).
 */
export class InputGroup {
  /** Text input for first name. */
  firstName: TextElement;
  /** Text input for last name. */
  lastName: TextElement;
  /** Text input for postal code. */
  postalCode: TextElement;

  /**
   * Creates an InputGroup instance for checkout forms.
   * @param {Page} page - Playwright Page object.
   * @example
   *   const group = new InputGroup(page);
   */
  constructor(page: Page) {
    this.firstName = new TextElement(page, '[data-test="firstName"]');
    this.lastName = new TextElement(page, '[data-test="lastName"]');
    this.postalCode = new TextElement(page, '[data-test="postalCode"]');
  }
}
