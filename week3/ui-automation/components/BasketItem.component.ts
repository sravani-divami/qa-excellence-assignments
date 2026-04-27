import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './Base.component';

/**
 * Represents a single product row inside the basket list.
 *
 * Each `BasketItem` is scoped to one `<li class="list-group-item lh-condensed">` element.
 * Item rows are distinguished from the total row by the `lh-condensed` class.
 *
 * HTML reference:
 * ```html
 * <li class="list-group-item d-flex justify-content-between lh-condensed">
 *   <div>
 *     <h6 class="my-0">Bubbly</h6>
 *     <small class="text-muted">x 1</small>
 *     <br>
 *     <a class="small" href="javascript:removeItem(15);">Delete Item</a>
 *   </div>
 *   <span class="text-muted">£0.10</span>
 * </li>
 * ```
 */
export class BasketItem extends BaseComponent {

    /**
     * {
     *   "description": "Creates a BasketItem scoped to a single <li.lh-condensed> row locator.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "root": "Locator targeting the specific <li> element for this basket item row."
     *   },
     *   "usage": "new BasketItem(page, page.locator('li.list-group-item.lh-condensed').nth(0))"
     * }
     */
    constructor(page: Page, root: Locator) {
        super(page, root);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the product name displayed in the basket row.",
     *   "usage": "const name = await item.getName();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Bubbly\""
     * }
     */
    async getName(): Promise<string> {
        await this.ensureReady();
        return (await this.root.locator('h6.my-0').textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns the quantity as a number, parsed from the 'x N' small text.",
     *   "usage": "const qty = await item.getQuantity();",
     *   "returns": "Promise<number>",
     *   "outputExample": "1"
     * }
     */
    async getQuantity(): Promise<number> {
        await this.ensureReady();
        const text = await this.root.locator('small.text-muted').textContent();
        const match = text?.match(/\d+/);
        return match ? parseInt(match[0], 10) : 0;
    }

    /**
     * {
     *   "description": "Returns the item price as a float number, parsed from the '£N.NN' span.",
     *   "usage": "const price = await item.getPrice();",
     *   "returns": "Promise<number>",
     *   "outputExample": "0.10"
     * }
     */
    async getPrice(): Promise<number> {
        await this.ensureReady();
        const text = await this.root.locator('span.text-muted').textContent();
        const clean = text?.replace(/[^0-9.]/g, '');
        return clean ? parseFloat(clean) : 0;
    }

    // ─── Action ───────────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Clicks the 'Delete Item' anchor link to remove this product from the basket.",
     *   "usage": "await item.deleteItem();",
     *   "returns": "Promise<void>"
     * }
     */
    async deleteItem(): Promise<void> {
        await this.ensureReady();
        await this.root.locator('a.small', { hasText: 'Delete Item' }).click();
        // Wait for this item row to be removed from DOM (JS updates basket synchronously)
        await this.root.waitFor({ state: 'detached', timeout: 5000 }).catch(() => {});
    }
}
