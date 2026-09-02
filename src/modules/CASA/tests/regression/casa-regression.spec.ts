import { test, expect } from '../../../../framework/fixtures/fixtures';
import { AccountOpeningPage, AccountOpeningFormData } from '../../pages/AccountOpeningPage';
import { CasaValidator } from '../../validators/CasaValidator';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

test.describe('CASA Regression @regression @casa', () => {
  let createData: AccountOpeningFormData;

  test.beforeAll(() => {
    createData = TestDataLoader.load<AccountOpeningFormData>(
      ConfigManager.getTestDataPath('CASA.xlsx'),
      { operation: 'create' },
    )[0];
  });

  test('01 - Maker: Create CASA account', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const casaPage = new AccountOpeningPage(page);
    await casaPage.goto();
    await casaPage.openCreateForm();
    const toast = await casaPage.create(createData);
    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('reg_casa_custNo', createData.customerNumber ?? '');
  });

  test('02 - Verify: Account in pending grid', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const casaPage = new AccountOpeningPage(page);
    await casaPage.goto();
    await casaPage.switchToPendingTab();
    const custNo = SharedDataStore.getOrThrow<string>('reg_casa_custNo');
    const inGrid = await casaPage.isRecordInPendingGrid(custNo);
    expect(inGrid).toBe(true);
  });

  test('03 - Checker: Authorize account', async ({ checkerContext, db }) => {
    const page = getPage(checkerContext);
    await page.bringToFront();
    const casaPage = new AccountOpeningPage(page);
    const custNo = SharedDataStore.getOrThrow<string>('reg_casa_custNo');
    await casaPage.goto();
    await casaPage.switchToPendingTab();
    const toast = await casaPage.approve(custNo);
    expect(toast).toMatch(/success|authoriz/i);
    if (db.isConnected()) {
      await new CasaValidator(db).validateAuthorized(custNo);
    }
  });

  test('04 - Verify: Account in authorized grid', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const casaPage = new AccountOpeningPage(page);
    await casaPage.goto();
    await casaPage.switchToAuthorizedTab();
    const custNo = SharedDataStore.getOrThrow<string>('reg_casa_custNo');
    const row = page.locator('#dt-authdata tbody tr').filter({ hasText: custNo }).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
  });
});
