import { Locator, Page } from '@playwright/test';
import { BaseComponent } from './Base.component';
import { BtnElement } from '../elements/btn.element';

/**
 * Represents a single product card in the Sweet Shop.
 *
 * Used on both the **Home page** (most popular section) and the **Sweets page**
 * (full product listing). Each card is scoped to a `div.card` element.
 *
 * HTML reference:
 * ```html
 * <div class="card">
 *   <img class="card-img-top" src="img/cups.jpg" alt="...">
 *   <div class="card-body">
 *     <h4 class="card-title">Chocolate Cups</h4>
 *     <p class="card-text">Candy Chocolate Cups.</p>
 *     <p><small class="text-muted">£1.00</small></p>
 *   </div>
 *   <div class="card-footer">
 *     <a class="btn btn-success btn-block addItem"
 *        data-id="1" data-name="Chocolate Cups" data-price="1.00">
 *       Add to Basket
 *     </a>
 *   </div>
 * </div>
 * ```
 */
export class ProductCard extends BaseComponent {

    /** BtnElement wrapping the Add to Basket anchor-button in the card footer. */
    readonly addToBasket: BtnElement;

    /**
     * {
     *   "description": "Creates a ProductCard scoped to a single div.card locator.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "root": "Locator targeting the specific div.card element for this product."
     *   },
     *   "usage": "new ProductCard(page, page.locator('div.card').nth(0))"
     * }
     */
    constructor(page: Page, root: Locator) {
        super(page, root);
        this.addToBasket = new BtnElement(page, this.root.locator('a.addItem'));
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the product title text from the card.",
     *   "usage": "const name = await card.getName();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Chocolate Cups\""
     * }
     */
    async getName(): Promise<string> {
        await this.ensureReady();
        return (await this.root.locator('h4.card-title').textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns the product description text from the card body.",
     *   "usage": "const desc = await card.getDescription();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Candy Chocolate Cups.\""
     * }
     */
    async getDescription(): Promise<string> {
        await this.ensureReady();
        return (await this.root.locator('p.card-text').textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns the product price as a float number, parsed from the small.text-muted element.",
     *   "usage": "const price = await card.getPrice();",
     *   "returns": "Promise<number>",
     *   "outputExample": "1.00"
     * }
     */
    async getPrice(): Promise<number> {
        await this.ensureReady();
        const text = await this.root.locator('small.text-muted').textContent();
        const clean = text?.replace(/[^0-9.]/g, '');
        return clean ? parseFloat(clean) : 0;
    }

    /**
     * {
     *   "description": "Returns the price as a formatted string as displayed in the UI.",
     *   "usage": "const price = await card.getPriceText();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"£1.00\""
     * }
     */
    async getPriceText(): Promise<string> {
        await this.ensureReady();
        return (await this.root.locator('small.text-muted').textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns the product data-id from the Add to Basket button.",
     *   "usage": "const id = await card.getProductId();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"1\""
     * }
     */
    async getProductId(): Promise<string> {
        return await this.addToBasket.getDataId();
    }

    /**
     * {
     *   "description": "Returns the image src URL of the product card image.",
     *   "usage": "const src = await card.getImageSrc();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"https://sweetshop.netlify.app/img/cups.jpg\""
     * }
     */
    async getImageSrc(): Promise<string> {
        await this.ensureReady();
        return (await this.root.locator('img.card-img-top').getAttribute('src')) ?? '';
    }

    // ─── Action ───────────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Clicks the 'Add to Basket' button on this card.",
     *   "usage": "await card.clickAddToBasket();",
     *   "returns": "Promise<void>"
     * }
     */
    async clickAddToBasket(): Promise<void> {
        await this.addToBasket.click();
        // BtnElement.click() already waits 500ms; app JS updates badge synchronously
    }
}
