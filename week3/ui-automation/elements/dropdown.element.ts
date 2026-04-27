import { Page, Locator } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents a native HTML `<select>` dropdown element styled with Bootstrap's
 * `custom-select` class in the Sweet Shop application.
 *
 * Supports an optional error locator for inline Bootstrap `.invalid-feedback`
 * validation messages rendered as a sibling element.
 *
 * HTML reference:
 * ```html
 * <!-- Country -->
 * <select class="custom-select d-block w-100" id="country" required>
 *   <option value="">Choose...</option>
 *   <option>United Kingdom</option>
 * </select>
 * <div class="invalid-feedback">Please select a valid country.</div>
 *
 * <!-- City -->
 * <select class="custom-select d-block w-100" id="city" required>
 *   <option value="">Choose...</option>
 *   <option>Bristol</option>
 *   <option>Cardiff</option>
 *   <option>Swansea</option>
 * </select>
 * <div class="invalid-feedback">Please provide a valid state.</div>
 * ```
 */
export class DropdownElement extends BaseElement {

    /** Optional locator for the sibling `.invalid-feedback` error div. */
    private readonly errorLocator?: Locator;

    /**
     * {
     *   "description": "Creates a DropdownElement wrapping a native <select> element with an optional error locator.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "selectSelector": "Locator or CSS/XPath string targeting the <select> element.",
     *     "errorSelector": "(Optional) Locator or CSS/XPath string targeting the .invalid-feedback div."
     *   },
     *   "usage": "new DropdownElement(page, page.locator('#country'), page.locator('#country ~ .invalid-feedback'))"
     * }
     */
    constructor(
        page: Page,
        selectSelector: Locator | string,
        errorSelector?: Locator | string
    ) {
        if (typeof selectSelector === 'string') selectSelector = page.locator(selectSelector);
        super(page, selectSelector);
        if (errorSelector) {
            this.errorLocator = typeof errorSelector === 'string'
                ? page.locator(errorSelector)
                : errorSelector;
        }
    }

    // ─── Selection ────────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Selects an option by its visible text label.",
     *   "usage": "await country.selectByText('United Kingdom');",
     *   "params": { "text": "Visible text of the option to select." },
     *   "returns": "Promise<void>",
     *   "outputExample": "Selects 'United Kingdom' in the Country dropdown."
     * }
     */
    async selectByText(text: string): Promise<void> {
        await this.element.waitFor({ state: 'visible' });
        await this.element.selectOption({ label: text });
    }

    /**
     * {
     *   "description": "Selects an option by its value attribute.",
     *   "usage": "await city.selectByValue('Bristol');",
     *   "params": { "value": "The value attribute of the <option> to select." },
     *   "returns": "Promise<void>",
     *   "outputExample": "Selects the option whose value='Bristol'."
     * }
     */
    async selectByValue(value: string): Promise<void> {
        await this.element.waitFor({ state: 'visible' });
        await this.element.selectOption({ value });
    }

    /**
     * {
     *   "description": "Selects an option by its zero-based index position in the list.",
     *   "usage": "await city.selectByIndex(1);",
     *   "params": { "index": "Zero-based index of the option to select." },
     *   "returns": "Promise<void>",
     *   "outputExample": "Selects the second option (index 1) in the dropdown."
     * }
     */
    async selectByIndex(index: number): Promise<void> {
        await this.element.waitFor({ state: 'visible' });
        await this.element.selectOption({ index });
    }

    // ─── Value & Options ──────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the currently selected option's visible text.",
     *   "usage": "const selected = await country.getValue();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"United Kingdom\""
     * }
     */
    async getValue(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        return await this.element.inputValue();
    }

    /**
     * {
     *   "description": "Returns all available option labels in the dropdown, excluding the placeholder 'Choose...' option.",
     *   "usage": "const options = await city.getOptions();",
     *   "returns": "Promise<string[]>",
     *   "outputExample": "[\"Bristol\", \"Cardiff\", \"Swansea\"]"
     * }
     */
    async getOptions(): Promise<string[]> {
        await this.element.waitFor({ state: 'visible' });
        return await this.element.evaluate((select: HTMLSelectElement) =>
            Array.from(select.options)
                .map(o => o.text.trim())
                .filter(t => t !== '' && t !== 'Choose...')
        );
    }

    /**
     * {
     *   "description": "Returns all available option labels including the placeholder entry.",
     *   "usage": "const all = await city.getAllOptions();",
     *   "returns": "Promise<string[]>",
     *   "outputExample": "[\"Choose...\", \"Bristol\", \"Cardiff\", \"Swansea\"]"
     * }
     */
    async getAllOptions(): Promise<string[]> {
        await this.element.waitFor({ state: 'visible' });
        return await this.element.evaluate((select: HTMLSelectElement) =>
            Array.from(select.options).map(o => o.text.trim())
        );
    }

    /**
     * {
     *   "description": "Returns the total number of options in the dropdown (including placeholder).",
     *   "usage": "const count = await city.getOptionCount();",
     *   "returns": "Promise<number>",
     *   "outputExample": "4"
     * }
     */
    async getOptionCount(): Promise<number> {
        await this.element.waitFor({ state: 'visible' });
        return await this.element.evaluate((select: HTMLSelectElement) => select.options.length);
    }

    // ─── Attributes ───────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns whether the select element has the required attribute set.",
     *   "usage": "const req = await country.isRequired();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true"
     * }
     */
    async isRequired(): Promise<boolean> {
        return (await this.element.getAttribute('required')) !== null;
    }

    // ─── Validation ───────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the inline validation error message from the .invalid-feedback element. Throws if no error locator was provided.",
     *   "usage": "const err = await country.getError();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Please select a valid country.\""
     * }
     */
    async getError(): Promise<string> {
        if (!this.errorLocator) {
            throw new Error('No error locator was provided to this DropdownElement.');
        }
        await this.errorLocator.waitFor({ state: 'visible', timeout: 10000 });
        return (await this.errorLocator.textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns whether the error message element is currently visible.",
     *   "usage": "const hasError = await country.hasError();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true"
     * }
     */
    async hasError(): Promise<boolean> {
        if (!this.errorLocator) return false;
        return await this.errorLocator.isVisible();
    }
}
