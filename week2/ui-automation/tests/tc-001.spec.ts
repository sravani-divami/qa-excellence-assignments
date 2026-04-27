// tc-001.spec.ts
// Covers: Login scenarios for all user types
import { test, expect } from '@playwright/test';

import { users, loginAs } from '../utils';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login Page', () => {
  for (const user of users) {
    test(`Login as ${user.username}`, async ({ page }) => {
      const login = new LoginPage(page);
      await login.goto();
      await loginAs(page, user.username, user.password);
      if (user.username === 'locked_out_user') {
        await expect(page.locator(login.errorMessage)).toBeVisible();
        await expect(page.locator(login.errorMessage)).toContainText('locked out');
      } else if (user.username === 'problem_user') {
        await expect(page).toHaveURL(/inventory/);
        // Additional checks for broken images/UI can be added here
      } else if (user.username === 'performance_glitch_user') {
        await expect(page).toHaveURL(/inventory/);
        // Optionally measure load time
      } else {
        await expect(page).toHaveURL(/inventory/);
      }
    });
  }
});
