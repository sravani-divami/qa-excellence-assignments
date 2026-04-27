import { defineConfig, devices } from '@playwright/test';
import { ENV } from './env/env.config';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Limit workers to avoid hammering Netlify (rate limiting / slow responses) */
  workers: process.env.CI ? 1 : 2,
  /* Per-test timeout: generous to handle slow Netlify responses */
  timeout: 90000,
  /* Reporters: Allure for rich HTML reports + line output for CI logs */
  reporter: [
    ['line'],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: true }],
    ['html', { open: 'never', outputFolder: '../reports/ui-automation-report' }],
  ],
  use: {
    /* Base URL loaded from env/env.config.ts. Override with ENV=qa|dev or BASE_URL env var. */
    baseURL: ENV.BASE_URL,
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    /* Video on first retry */
    video: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
