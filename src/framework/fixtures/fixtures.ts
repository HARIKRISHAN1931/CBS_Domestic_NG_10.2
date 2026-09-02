import { test as base, Page, BrowserContext } from '@playwright/test';
import { config } from '../config/config';
import { AuthManager } from '../auth/AuthManager';
import { DatabaseConnectionManager } from '../database/DatabaseConnectionManager';
import { StepRecorder } from '../reports/collectors/StepRecorder';
import { ReportCollector } from '../reports/collectors/ReportCollector';
import { TestResult } from '../reports/core/ReportSchema';

export type CbsFixtures = {
  authenticatedPage:        Page;
  checkerAuthenticatedPage: Page;
  makerContext:             BrowserContext;
  checkerContext:           BrowserContext;
  db:                       DatabaseConnectionManager;
  recorder:                 StepRecorder;
};

export const test = base.extend<CbsFixtures>({
  makerContext: async ({ browser }, use) => {
    const { context } = await AuthManager.createMakerSession(browser);
    await use(context);
    await context.close().catch(() => {});
  },

  checkerContext: async ({ browser }, use) => {
    const { context } = await AuthManager.createCheckerSession(browser);
    await use(context);
    await context.close().catch(() => {});
  },

  authenticatedPage: async ({ browser }, use) => {
    const { context, page } = await AuthManager.createMakerSession(browser);
    await use(page);
    await context.close().catch(() => {});
  },

  checkerAuthenticatedPage: async ({ browser }, use) => {
    const { context, page } = await AuthManager.createCheckerSession(browser);
    await use(page);
    await context.close().catch(() => {});
  },

  db: async ({}, use) => {
    const db = new DatabaseConnectionManager();
    if (config.db.host) await db.connect();
    await use(db);
    if (config.db.host) await db.disconnect();
  },

  // Auto-injected StepRecorder — reads module/screen from test info
  recorder: async ({ authenticatedPage }, use, testInfo) => {
    const parts  = testInfo.file.replace(/\\/g, '/').split('/');
    const modIdx = parts.indexOf('modules');
    const module = modIdx >= 0 ? (parts[modIdx + 1] ?? 'Unknown') : 'Unknown';

    // Find the TestResult that CbsReporter created for this test
    // (attached in onTestBegin via __cbsResult)
    const testResult: TestResult = (testInfo as any).__cbsResult
      ?? ReportCollector.beginTest({
           module,
           screenId:    module.toUpperCase(),
           screenTitle: testInfo.title,
           title:       testInfo.title,
           suite:       'other',
         });

    const rec = new StepRecorder(
      testResult,
      authenticatedPage,
      module,
      module.toUpperCase(),
      testInfo.title,
    );
    await use(rec);
  },
});

export { expect } from '@playwright/test';
