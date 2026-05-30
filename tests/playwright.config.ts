import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './scenarios',
  timeout: 15000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:4010',
    extraHTTPHeaders: {
      'Content-Type': 'application/json',
    },
  },
  projects: [
    { name: 'api', testMatch: '**/api/*.spec.ts' },
    {
      name: 'e2e',
      testMatch: '**/e2e/*.spec.ts',
      use: {
        browserName: 'chromium',
        baseURL: 'http://localhost:5173',
      },
    },
  ],
});
