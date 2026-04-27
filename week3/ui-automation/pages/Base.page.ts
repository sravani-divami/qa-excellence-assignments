import { Page } from '@playwright/test';
import { ENV } from '../env/env.config';

const BASE_URL = ENV.BASE_URL;

/**
 * Base class for all Sweet Shop page objects.
 *
 * Provides common helpers — navigation, page title, and current URL.
 * All page classes must extend BasePage.
 */
export class BasePage {

    /**
     * {
     *   "description": "Creates a BasePage wrapping the Playwright Page instance.",
     *   "params": {
     *     "page": "Active Playwright Page instance."
     *   }
     * }
     */
    constructor(protected readonly page: Page) {}

    // ─── Navigation ───────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Navigates to an absolute URL or a path appended to the Sweet Shop base URL.",
     *   "usage": "await this.navigate('/basket'); or await this.navigate('https://...')",
     *   "params": { "path": "Absolute URL or relative path (e.g. '/sweets', '/basket')." },
     *   "returns": "Promise<void>"
     * }
     */
    async navigate(path: string): Promise<void> {
        const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
        // Wait for 'load' (allows deferred JS to run), but don't fail on slow images
        await this.page.waitForLoadState('load', { timeout: 5000 }).catch(() => {});
    }

    // ─── Page State ───────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the current page <title> text.",
     *   "usage": "const title = await this.getTitle();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Sweet Shop\""
     * }
     */
    async getTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * {
     *   "description": "Returns the current page URL.",
     *   "usage": "const url = this.getCurrentUrl();",
     *   "returns": "string",
     *   "outputExample": "\"https://sweetshop.netlify.app/basket\""
     * }
     */
    getCurrentUrl(): string {
        return this.page.url();
    }

    /**
     * {
     *   "description": "Waits for the given number of milliseconds. Use sparingly.",
     *   "usage": "await this.wait(500);",
     *   "params": { "ms": "Milliseconds to wait." },
     *   "returns": "Promise<void>"
     * }
     */
    async wait(ms: number): Promise<void> {
        await this.page.waitForTimeout(ms);
    }
}
