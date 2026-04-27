import { Page, Locator } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents a native HTML `<button>` element in the Sweet Shop application.
 *
 * Use this for `<button>` tags. For Bootstrap anchor-buttons (`<a class="btn">`),
 * use `BtnElement` instead.
 *
 * HTML reference:
 * ```html
 * <button type="submit" id="btn_login" class="btn btn-primary">Login</button>
 * ```
 */
export class ButtonElement extends BaseElement {

    /**
     * {
     *   "description": "Creates a ButtonElement wrapping a native <button> element.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "selector": "A Playwright Locator or CSS/XPath string targeting the <button> element."
     *   },
     *   "usage": "new ButtonElement(page, page.locator('#btn_login'))"
     * }
     */
    constructor(page: Page, selector: Locator | string) {
        if (typeof selector === 'string') selector = page.locator(selector);
        super(page, selector);
    }

    // ─── Label & Type ─────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the visible text label on the button.",
     *   "usage": "const label = await btn.getLabel();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Login\""
     * }
     */
    async getLabel(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        return (await this.element.textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns the type attribute of the button (submit, button, reset).",
     *   "usage": "const type = await btn.getType();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"submit\""
     * }
     */
    async getType(): Promise<string> {
        return (await this.element.getAttribute('type')) ?? 'button';
    }

    // ─── Bootstrap Variant Checks ─────────────────────────────────────────────

    /**
     * {
     *   "description": "Checks whether the button has the Bootstrap 'btn-primary' (blue) variant class.",
     *   "usage": "const isPrimary = await btn.isPrimary();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true"
     * }
     */
    async isPrimary(): Promise<boolean> {
        const cls = await this.element.getAttribute('class');
        return cls?.includes('btn-primary') ?? false;
    }

    /**
     * {
     *   "description": "Checks whether the button has the Bootstrap 'btn-secondary' variant class.",
     *   "usage": "const isSecondary = await btn.isSecondary();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "false"
     * }
     */
    async isSecondary(): Promise<boolean> {
        const cls = await this.element.getAttribute('class');
        return cls?.includes('btn-secondary') ?? false;
    }

    /**
     * {
     *   "description": "Checks whether the button has the Bootstrap 'btn-success' (green) variant class.",
     *   "usage": "const isSuccess = await btn.isSuccess();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "false"
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
     *   "description": "Returns the full CSS class attribute string of the button.",
     *   "usage": "const cls = await btn.getVariantClass();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"btn btn-primary\""
     * }
     */
    async getVariantClass(): Promise<string> {
        return (await this.element.getAttribute('class')) ?? '';
    }
}
