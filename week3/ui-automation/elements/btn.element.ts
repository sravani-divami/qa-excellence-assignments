import { Page, Locator } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents a Bootstrap-style anchor/button element used in the Sweet Shop application.
 *
 * Wraps an `<a class="btn ...">` tag that acts as a clickable action button.
 * Commonly used for "Add to Basket" buttons that carry product metadata
 * as HTML `data-*` attributes.
 *
 * HTML reference:
 * ```html
 * <a class="btn btn-success btn-block addItem"
 *    data-id="2"
 *    data-name="Sherbert Straws"
 *    data-price="0.75">Add to Basket</a>
 * ```
 */
export class BtnElement extends BaseElement {

    /**
     * {
     *   "description": "Creates a BtnElement wrapping a Bootstrap anchor-button.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "selector": "A Playwright Locator or CSS/XPath string targeting the <a class='btn'> element."
     *   },
     *   "usage": "new BtnElement(page, page.locator('a.addItem[data-id=\"2\"]'))"
     * }
     */
    constructor(page: Page, selector: Locator | string) {
        if (typeof selector === 'string') {
            selector = page.locator(selector);
        }
        super(page, selector);
    }

    /**
     * {
     *   "description": "Returns the product ID from the data-id attribute.",
     *   "usage": "const id = await btn.getDataId();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"2\""
     * }
     */
    async getDataId(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        return (await this.element.getAttribute('data-id')) ?? '';
    }

    /**
     * {
     *   "description": "Returns the product name from the data-name attribute.",
     *   "usage": "const name = await btn.getDataName();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Sherbert Straws\""
     * }
     */
    async getDataName(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        return (await this.element.getAttribute('data-name')) ?? '';
    }

    /**
     * {
     *   "description": "Returns the product price from the data-price attribute as a float number.",
     *   "usage": "const price = await btn.getDataPrice();",
     *   "returns": "Promise<number>",
     *   "outputExample": "0.75"
     * }
     */
    async getDataPrice(): Promise<number> {
        await this.element.waitFor({ state: 'visible' });
        const raw = await this.element.getAttribute('data-price');
        return raw ? parseFloat(raw) : 0;
    }

    /**
     * {
     *   "description": "Returns the visible text label on the button.",
     *   "usage": "const label = await btn.getLabel();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Add to Basket\""
     * }
     */
    async getLabel(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        return (await this.element.textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Checks whether the button has the Bootstrap 'btn-success' (green) variant class.",
     *   "usage": "const isSuccess = await btn.isSuccess();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true"
     * }
     */
    async isSuccess(): Promise<boolean> {
        const cls = await this.element.getAttribute('class');
        return cls?.includes('btn-success') ?? false;
    }

    /**
     * {
     *   "description": "Checks whether the button has the Bootstrap 'btn-danger' (red) variant class.",
     *   "usage": "const isDanger = await btn.isDanger();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "false"
     * }
     */
    async isDanger(): Promise<boolean> {
        const cls = await this.element.getAttribute('class');
        return cls?.includes('btn-danger') ?? false;
    }

    /**
     * {
     *   "description": "Checks whether the button has the Bootstrap 'btn-warning' (yellow) variant class.",
     *   "usage": "const isWarning = await btn.isWarning();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "false"
     * }
     */
    async isWarning(): Promise<boolean> {
        const cls = await this.element.getAttribute('class');
        return cls?.includes('btn-warning') ?? false;
    }

    /**
     * {
     *   "description": "Returns the full CSS class attribute string of the button.",
     *   "usage": "const cls = await btn.getVariantClass();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"btn btn-success btn-block addItem\""
     * }
     */
    async getVariantClass(): Promise<string> {
        return (await this.element.getAttribute('class')) ?? '';
    }
}
