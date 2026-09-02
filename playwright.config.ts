import { defineConfig } from '@playwright/test';

const bank = (process.env.BANK ?? 'BDCC').toUpperCase();
const env  = (process.env.ENV  ?? 'QA').toUpperCase();

export default defineConfig({
  testDir:       './src/modules',
  testMatch:     ['**/*.spec.ts'],
  globalSetup:   './src/framework/config/global-setup.ts',
  fullyParallel: false,
  forbidOnly:    !!process.env.CI,
  retries:       process.env.CI ? 2 : 0,
  workers:       process.env.WORKERS ? Number(process.env.WORKERS) : 1,
  timeout:       120_000,
  expect:        { timeout: 10_000 },

  reporter: [
    ['./dist/src/framework/reports/CbsReporter', { outputDir: 'reports/cbs' }],
    ['html',              { outputFolder: 'reports/html', open: 'never' }],
    ['allure-playwright', { outputFolder: 'allure-results', detail: true, suiteTitle: true }],
    ['list'],
    ['json',              { outputFile: 'reports/results.json' }],
  ],

  use: {
    trace:             'retain-on-failure',
    screenshot:        'only-on-failure',
    video:             'on-first-retry',
    actionTimeout:     15_000,
    navigationTimeout: 30_000,
  },

  projects: [
    {
      name: `${bank}-${env}`,
      use: {
        browserName:   'chromium',
        viewport:      null,
        launchOptions: {
          args: ['--start-maximized'],
        },
      },
    },
  ],

  outputDir: 'test-results',
});
