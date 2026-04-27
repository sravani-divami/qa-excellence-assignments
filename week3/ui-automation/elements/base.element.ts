import { Locator, Page } from '@playwright/test';
import { TIMEOUTS } from '../env/timeouts';

/**
 * Base class for all framework element wrappers.
 *
 * Provides core Playwright interaction primitives — visibility checks,
 * click with network settle, scroll, and raw locator access.
 * All element classes must extend BaseElement.
 */
export class BaseElement {
    protected page: Page;
    protected element: Locator;

    /**
     * {
     *   "description": "Creates a BaseElement wrapping a Playwright Locator or CSS/XPath selector string.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "selector": "A Playwright Locator or a CSS/XPath selector string."
     *   }
     * }
     */
    constructor(page: Page, selector: Locator | string) {
        this.page = page;
        this.element = typeof selector === 'string' ? page.locator(selector) : selector;
    }

    /**
     * {
     *   "description": "Waits for the element to be visible, scrolls it into view, clicks it, then waits for the page to settle.",
     *   "usage": "await btn.click();",
     *   "returns": "Promise<void>"
     * }
     */
    async click(): Promise<void> {
        await this.element.waitFor({ state: 'visible', timeout: TIMEOUTS.PAGE_LOADING_TIMEOUT });
        await this.element.scrollIntoViewIfNeeded();
        await this.element.click();
        await this.page.waitForTimeout(TIMEOUTS.CLICK_TIMEOUT);
    }

    /**
     * {
     *   "description": "Highlights the element in the browser (useful during debugging).",
     *   "usage": "await el.highlight();",
     *   "returns": "void"
     * }
     */
    highlight(): void {
        this.element.highlight();
    }

    /**
     * {
     *   "description": "Checks whether the element is disabled.",
     *   "usage": "const disabled = await el.isDisabled();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true | false"
     * }
     */
    async isDisabled(): Promise<boolean> {
        await this.element.waitFor({ state: 'visible' });
        return await this.element.isDisabled();
    }

    /**
     * {
     *   "description": "Checks whether the element is currently visible on the page.",
     *   "usage": "const visible = await el.isVisible();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true | false"
     * }
     */
    async isVisible(): Promise<boolean> {
        return await this.element.isVisible({ timeout: TIMEOUTS.PAGE_LOADING_TIMEOUT });
    }

    /**
     * {
     *   "description": "Returns the raw Playwright Locator for advanced/direct usage.",
     *   "usage": "const loc = el.raw; await expect(loc).toBeVisible();",
     *   "returns": "Locator"
     * }
     */
    get raw(): Locator {
        return this.element;
    }
}
