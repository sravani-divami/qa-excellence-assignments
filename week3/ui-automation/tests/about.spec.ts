import { test, expect } from '@playwright/test';
import { AboutPage } from '../pages/AboutPage';

/**
 * TC-108, TC-109 — About Page (v3.1 numbering)
 *
 * Verifies the About page heading and content render correctly.
 */
test.describe('About Page', () => {

    let about: AboutPage;

    test.beforeEach(async ({ page }) => {
        about = new AboutPage(page);
        await about.open();
    });

    // ── TC-150: promotional banner ────────────────────────────────────────────
    test('TC-150 | page title contains Sweet Shop', async ({ page }) => {
        await expect(page).toHaveTitle(/Sweet Shop/i);
    });

    // ── TC-109: heading and content render ──────────────────────────────────
    test('TC-109 | Sweet Shop Project heading is visible', async ({ page }) => {
        await expect(page.getByRole('heading', { name: 'Sweet Shop Project' })).toBeVisible();
    });

    test('TC-109 | About page body text is present', async () => {
        const body = await about.getBodyText();
        expect(body.length).toBeGreaterThan(20);
    });

    test('TC-108 | /about URL is correct', async ({ page }) => {
        await expect(page).toHaveURL(/\/about/);
    });
});
