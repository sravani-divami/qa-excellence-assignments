import { Page } from '@playwright/test';
import { BasePage } from './Base.page';
import { NavbarComponent } from '../components/Navbar.component';

/**
 * Page Object for the Sweet Shop About page (`/about`).
 *
 * A static informational page with no interactive elements beyond
 * the global navigation bar.
 *
 * HTML reference:
 * ```html
 * <h1>Sweet Shop Project</h1>
 * <p>An intentionally broken web application to help demonstrate Chrome DevTools.</p>
 * ```
 */
export class AboutPage extends BasePage {

    /**
     * {
     *   "description": "Global navigation bar.",
     *   "usage": "await aboutPage.navbar.clickNavLink('Login');"
     * }
     */
    readonly navbar: NavbarComponent;

    /**
     * {
     *   "description": "Creates the AboutPage and initialises the navbar component.",
     *   "params": { "page": "Active Playwright Page instance." },
     *   "usage": "const aboutPage = new AboutPage(page);"
     * }
     */
    constructor(page: Page) {
        super(page);
        this.navbar = new NavbarComponent(page);
    }

    // ─── Navigation ───────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Navigates to the About page and waits for it to load.",
     *   "usage": "await aboutPage.open();",
     *   "returns": "Promise<void>"
     * }
     */
    async open(): Promise<void> {
        await this.navigate('/about');
        await this.page.locator('nav.navbar').waitFor({ state: 'visible', timeout: 10000 });
    }

    // ─── Page Content ─────────────────────────────────────────────────────────

    /**
     * {
     *   "description": "Returns the H1 heading text of the about page.",
     *   "usage": "const heading = await aboutPage.getHeading();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"Sweet Shop Project\""
     * }
     */
    async getHeading(): Promise<string> {
        return (await this.page.locator('h1').first().textContent())?.trim() ?? '';
    }

    /**
     * {
     *   "description": "Returns the main body text content of the about page (the lead paragraph).",
     *   "usage": "const body = await aboutPage.getBodyText();",
     *   "returns": "Promise<string>",
     *   "outputExample": "\"An intentionally broken web application...\""
     * }
     */
    async getBodyText(): Promise<string> {
        return (await this.page.locator('p.lead, p').first().textContent())?.trim() ?? '';
    }
}
