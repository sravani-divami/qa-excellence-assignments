import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 2,
  workers: 1, // Sequential execution to avoid rate limiting
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: '../reports/api-automation-report' }],
    ['allure-playwright', { outputFolder: 'allure-results', suiteTitle: true }]
  ],
  use: {
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'petstore-api',
      use: {
        baseURL: 'https://petstore.swagger.io/v2',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
    },
  ],
});
