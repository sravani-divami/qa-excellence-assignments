import { Locator, Page } from '@playwright/test';
import { TIMEOUTS } from '../env/timeouts';

/**
 * Base class for all app components.
 *
 * Components are composite UI widgets that compose multiple locators
 * and framework elements. Every component has a root locator that
 * scopes all its child locators.
 */
export class BaseComponent {

    /**
     * {
     *   "description": "Creates a BaseComponent scoped to the given root locator.",
     *   "params": {
     *     "page": "Active Playwright Page instance.",
     *     "root": "Root Locator that contains the entire component."
     *   }
     * }
     */
    constructor(
        protected readonly page: Page,
        protected readonly root: Locator
    ) {}

    /**
     * {
     *   "description": "Returns whether the component's root element is currently visible.",
     *   "usage": "const visible = await component.isVisible();",
     *   "returns": "Promise<boolean>",
     *   "outputExample": "true | false"
     * }
     */
    async isVisible(): Promise<boolean> {
        return await this.root.isVisible();
    }

    /**
     * {
     *   "description": "Waits until the component's root element is visible. Call before interacting with children.",
     *   "usage": "await this.ensureReady();",
     *   "returns": "Promise<void>"
     * }
     */
    protected async ensureReady(): Promise<void> {
        await this.root.waitFor({ state: 'visible', timeout: TIMEOUTS.PAGE_LOADING_TIMEOUT });
    }
}
