import { expect, Page } from '@playwright/test';
import { NavbarComponent } from '../components/Navbar.component';

/**
 * Asserts that a visible heading on the page contains the expected text.
 */
export async function expectHeading(page: Page, expected: string): Promise<void> {
    await expect(page.locator('h1, h2, h3').filter({ hasText: expected }).first()).toBeVisible();
}

/**
 * Asserts the current page URL ends with the given path.
 */
export async function expectUrl(page: Page, path: string): Promise<void> {
    await expect(page).toHaveURL(new RegExp(`${path.replace('/', '\\/')}$`));
}

/**
 * Asserts the navbar basket badge shows the expected count.
 */
export async function expectNavBasketCount(navbar: NavbarComponent, expected: number): Promise<void> {
    const count = await navbar.getBasketCount();
    expect(count).toBe(expected);
}

/**
 * Parses a price string like "£1.50" and returns the numeric value 1.5.
 * Looks for £ followed by digits to avoid picking up other numbers in text.
 */
export function parsePriceText(text: string): number {
  // Try to find £ followed by a number (most reliable)
  const match = text.match(/£\s*([\d]+\.[\d]{2}|[\d]+)/);
  if (match) return parseFloat(match[1]);
  // Fallback: strip all non-digit/dot chars
  return parseFloat(text.replace(/[^0-9.]/g, '')) || 0;
}
