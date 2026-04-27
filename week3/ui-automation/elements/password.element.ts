import { Page, Locator } from '@playwright/test';
import { TextElement } from './text.element';

/**
 * Represents a password input field in the Sweet Shop application.
 *
 * Extends `TextElement` with password-specific behaviour:
 * - Reports the input type as "password"
 * - Notes that paste is intentionally disabled on this field (`onpaste="return false"`)
 *
 * HTML reference:
 * ```html
 * <input type="password" class="form-control" id="exampleInputPassword"
 *        placeholder="Password" required maxlength="30" onpaste="return false" tabindex="0">
 * <div class="invalid-feedback invalid-password">
 *   Please enter a valid password.
 * </div>
 * ```
 */
export class PasswordElement extends TextElement {

    /**
     * {
     *   "description": "Creates a PasswordElement wrapping a password <input> with an optional inline error locator.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "inputSelector": "Locator or CSS/XPath string targeting the <input type='password'> element.",
     *     "errorSelector": "(Optional) Locator or CSS/XPath string targeting the .invalid-feedback div."
     *   },
     *   "usage": "new PasswordElement(page, page.locator('#exampleInputPassword'), page.locator('.invalid-password'))"
     * }
     */
    constructor(page: Page, inputSelector: Locator | string, errorSelector?: Locator | string) {
        super(page, inputSelector, errorSelector);
    }

    /**
     * {
     *   "description": "Returns the input type, always 'password' for this element.",
     *   "usage": "const type = await pwd.getType();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"password\""
     * }
     */
    async getType(): Promise<string> {
        return (await this.element.getAttribute('type')) ?? 'password';
    }

    /**
     * {
     *   "description": "Indicates whether paste is disabled on this field. The Sweet Shop login password intentionally disables paste.",
     *   "usage": "const disabled = await pwd.isPasteDisabled();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true"
     * }
     */
    async isPasteDisabled(): Promise<boolean> {
        const handler = await this.element.getAttribute('onpaste');
        return handler?.includes('return false') ?? false;
    }
}
