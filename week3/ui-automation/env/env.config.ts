/**
 * Environment configuration for the Sweet Shop automation suite.
 *
 * Load the right env by setting the ENV variable before running:
 *   ENV=qa npx playwright test
 *
 * Defaults to 'qa' if ENV is not set.
 */

export interface AppEnv {
    BASE_URL: string;
    LOGIN_EMAIL: string;
    LOGIN_PASSWORD: string;
    ENV_NAME: string;
}

const environments: Record<string, AppEnv> = {
    qa: {
        BASE_URL: 'https://sweetshop.netlify.app',
        LOGIN_EMAIL: 'user@example.com',
        LOGIN_PASSWORD: 'Password1',
        ENV_NAME: 'QA',
    },
    dev: {
        BASE_URL: 'https://sweetshop.netlify.app',
        LOGIN_EMAIL: 'user@example.com',
        LOGIN_PASSWORD: 'Password1',
        ENV_NAME: 'DEV',
    },
};

const envKey = (process.env.ENV ?? 'qa').toLowerCase();

export const ENV: AppEnv = environments[envKey] ?? environments['qa'];
