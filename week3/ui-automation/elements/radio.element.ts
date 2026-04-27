import { Page, Locator } from '@playwright/test';
import { BaseElement } from './base.element';

/**
 * Represents a group of native HTML `<input type="radio">` options styled
 * with Bootstrap's `custom-control custom-radio` pattern.
 *
 * The element wraps the **group container** (the parent div that holds all
 * radio divs), not a single radio input. This allows selecting any option
 * by its label text from one element instance.
 *
 * HTML reference:
 * ```html
 * <div class="d-block my-3">                          ← pass this as selector
 *   <div class="custom-control custom-radio">
 *     <input type="radio" name="exampleRadios" id="exampleRadios1"
 *            value="0.00" checked>
 *     <label class="custom-control-label" for="exampleRadios1">
 *       Collect (FREE)
 *     </label>
 *   </div>
 *   <div class="custom-control custom-radio">
 *     <input type="radio" name="exampleRadios" id="exampleRadios2"
 *            value="1.99">
 *     <label class="custom-control-label" for="exampleRadios2">
 *       Standard Shipping (£1.99)
 *     </label>
 *   </div>
 * </div>
 * ```
 */
export class RadioElement extends BaseElement {

    /**
     * {
     *   "description": "Creates a RadioElement scoped to the group container div that holds all radio options.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "groupSelector": "Locator or CSS/XPath string targeting the parent container of all radio divs."
     *   },
     *   "usage": "new RadioElement(page, page.locator('.d-block.my-3'))"
     * }
     */
    constructor(page: Page, groupSelector: Locator | string) {
        if (typeof groupSelector === 'string') groupSelector = page.locator(groupSelector);
        super(page, groupSelector);
    }

    // ─── Selection ────────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Selects a radio option by clicking its label text. Clicking the label checks the paired radio input.",
     *   "usage": "await delivery.select('Collect (FREE)');",
     *   "params": { "labelText": "Visible text of the label associated with the radio option." },
     *   "returns": "Promise<void>",
     *   "outputExample": "Selects the 'Collect (FREE)' radio option."
     * }
     */
    async select(labelText: string): Promise<void> {
        await this.element.waitFor({ state: 'visible' });
        await this.element
            .locator('.custom-control-label', { hasText: labelText })
            .click();
        await this.page.waitForTimeout(300);
    }

    // ─── Reading State ────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the visible label text of the currently checked radio option.",
     *   "usage": "const selected = await delivery.getSelectedLabel();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Collect (FREE)\""
     * }
     */
    async getSelectedLabel(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        const checkedInput = this.element.locator('input[type="radio"]:checked');
        const id = await checkedInput.getAttribute('id');
        if (!id) return '';
        const label = this.element.locator(`label[for="${id}"]`);
        return (await label.textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns the value attribute of the currently checked radio input.",
     *   "usage": "const value = await delivery.getSelectedValue();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"0.00\""
     * }
     */
    async getSelectedValue(): Promise<string> {
        await this.element.waitFor({ state: 'visible' });
        const checkedInput = this.element.locator('input[type="radio"]:checked');
        return (await checkedInput.getAttribute('value')) ?? '';
    }

    /**
     * {
     *   "description": "Returns all available radio option labels in the group.",
     *   "usage": "const options = await delivery.getAllLabels();",
     *   "returns": "Promise<string[]>",
     *   "outputExample": "[\"Collect (FREE)\", \"Standard Shipping (£1.99)\"]"
     * }
     */
    async getAllLabels(): Promise<string[]> {
        await this.element.waitFor({ state: 'visible' });
        const labels = this.element.locator('.custom-control-label');
        const count = await labels.count();
        const texts: string[] = [];
        for (let i = 0; i < count; i++) {
            const text = await labels.nth(i).textContent();
            if (text) texts.push(text.trim());
        }
        return texts;
    }

    /**
     * {
     *   "description": "Checks whether a specific radio option (by label text) is currently selected.",
     *   "usage": "const isCollect = await delivery.isSelected('Collect (FREE)');",
     *   "params": { "labelText": "Visible label of the option to check." },
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true"
     * }
     */
    async isSelected(labelText: string): Promise<boolean> {
        const selected = await this.getSelectedLabel();
        return selected === labelText;
    }
}
