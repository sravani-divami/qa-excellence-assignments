// playwright.config.ts
import { defineConfig } from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config();

export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'https://www.saucedemo.com/',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
  },
  testDir: './ui-automation/tests',
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: './reports/ui-automation-report' }],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],
});
