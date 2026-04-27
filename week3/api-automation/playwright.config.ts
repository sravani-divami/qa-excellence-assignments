import { defineConfig } from '@playwright/test';

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  testDir: './tests',
  timeout: 30000,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../reports/api-automation-report' }],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: true }]
  ],
  projects: [
    {
      name: 'shopeasy-api',
      use: {
        baseURL: 'http://localhost:3000',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});
