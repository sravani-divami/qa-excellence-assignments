import { Page, Locator } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents a Bootstrap text/email input field in the Sweet Shop application.
 *
 * Supports an optional error locator for inline validation messages shown
 * inside a sibling `.invalid-feedback` div.
 *
 * HTML reference:
 * ```html
 * <div class="form-group">
 *   <label for="exampleInputEmail">Email address</label>
 *   <input type="email" class="form-control" id="exampleInputEmail"
 *          placeholder="you@example.com" required maxlength="255" tabindex="1">
 *   <div class="invalid-feedback invalid-email">
 *     Please enter a valid email address.
 *   </div>
 * </div>
 * ```
 */
export class TextElement extends BaseElement {

    /** Optional locator for the `.invalid-feedback` error message div. */
    private readonly errorLocator?: Locator;

    /**
     * {
     *   "description": "Creates a TextElement wrapping an <input> field with an optional inline error locator.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "inputSelector": "Locator or CSS/XPath string targeting the <input> element.",
     *     "errorSelector": "(Optional) Locator or CSS/XPath string targeting the .invalid-feedback div."
     *   },
     *   "usage": "new TextElement(page, page.locator('#exampleInputEmail'), page.locator('.invalid-email'))"
     * }
     */
    constructor(
        page: Page,
        inputSelector: Locator | string,
        errorSelector?: Locator | string
    ) {
        if (typeof inputSelector === 'string') inputSelector = page.locator(inputSelector);
        super(page, inputSelector);
        if (errorSelector) {
            this.errorLocator = typeof errorSelector === 'string'
                ? page.locator(errorSelector)
                : errorSelector;
        }
    }

    // ─── Input Interaction ────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Fills the input with the given value. Skips if the field is disabled.",
     *   "usage": "await email.set('user@example.com');",
     *   "params": { "value": "Text to type into the field." },
     *   "returns": "Promise<void>"
     * }
     */
    async set(value: string): Promise<void> {
        if (!await this.element.isDisabled()) {
            await this.element.waitFor({ state: 'visible' });
            await this.element.fill(value);
        }
    }

    /**
     * {
     *   "description": "Fills the input with the given value then presses Enter. Useful for inline search or submit-on-enter.",
     *   "usage": "await email.enter('user@example.com');",
     *   "params": { "value": "Text to type into the field." },
     *   "returns": "Promise<void>"
     * }
     */
    async enter(value: string): Promise<void> {
        await this.element.waitFor({ state: 'visible' });
        await this.element.fill(value);
        await this.element.press('Enter');
    }

    /**
     * {
     *   "description": "Clears the current value of the input field.",
     *   "usage": "await email.clear();",
     *   "returns": "Promise<void>"
     * }
     */
    async clear(): Promise<void> {
        await this.element.waitFor({ state: 'visible' });
        await this.element.clear();
    }

    // ─── Value & Attributes ───────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the current value typed into the input field.",
     *   "usage": "const value = await email.getValue();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"user@example.com\""
     * }
     */
    async getValue(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        return await this.element.inputValue();
    }

    /**
     * {
     *   "description": "Returns the placeholder text attribute of the input.",
     *   "usage": "const hint = await email.getPlaceholder();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"you@example.com\""
     * }
     */
    async getPlaceholder(): Promise<string> {
        return (await this.element.getAttribute('placeholder')) ?? '';
    }

    /**
     * {
     *   "description": "Returns the maxlength attribute value as a number. Returns -1 if not set.",
     *   "usage": "const max = await email.getMaxLength();",
     *   "returns": "Promise<number>",
     *   "outputExample": "255"
     * }
     */
    async getMaxLength(): Promise<number> {
        const val = await this.element.getAttribute('maxlength');
        return val ? parseInt(val, 10) : -1;
    }

    /**
     * {
     *   "description": "Returns whether the input has the required attribute set.",
     *   "usage": "const req = await email.isRequired();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true"
     * }
     */
    async isRequired(): Promise<boolean> {
        const attr = await this.element.getAttribute('required');
        return attr !== null;
    }

    // ─── Validation ───────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the inline validation error message from the .invalid-feedback element. Throws if no error locator was provided.",
     *   "usage": "const err = await email.getError();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Please enter a valid email address.\""
     * }
     */
    async getError(): Promise<string> {
        if (!this.errorLocator) {
            throw new Error('No error locator was provided to this TextElement.');
        }
        await this.errorLocator.waitFor({ state: 'visible', timeout: 10000 });
        return (await this.errorLocator.textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns whether the error message element is currently visible.",
     *   "usage": "const hasError = await email.hasError();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true"
     * }
     */
    async hasError(): Promise<boolean> {
        if (!this.errorLocator) return false;
        return await this.errorLocator.isVisible();
    }
}
