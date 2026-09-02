import { test, expect } from '../../../../framework/fixtures/fixtures';
import { TermDepositPage, TDContractData } from '../../pages/TermDepositPage';
import { TdValidator } from '../../validators/TdValidator';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

test.describe('TD Regression @regression @td', () => {
  let createData: TDContractData;

  test.beforeAll(() => {
    createData = TestDataLoader.load<TDContractData>(
      ConfigManager.getTestDataPath('TD.xlsx'),
      { operation: 'create' },
    )[0];
  });

  test('01 - Maker: Create TD contract', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const tdPage = new TermDepositPage(page);
    await tdPage.goto();
    await tdPage.openCreateForm();
    const toast = await tdPage.create(createData);
    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('reg_td_custCode', createData.customerCode);
  });

  test('02 - Verify: TD in pending grid', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const tdPage = new TermDepositPage(page);
    await tdPage.goto();
    await tdPage.switchToPendingTab();
    const custCode = SharedDataStore.getOrThrow<string>('reg_td_custCode');
    const inGrid = await tdPage.isRecordInPendingGrid(custCode);
    expect(inGrid).toBe(true);
  });

  test('03 - Checker: Authorize TD contract', async ({ checkerContext, db }) => {
    const page = getPage(checkerContext);
    await page.bringToFront();
    const tdPage = new TermDepositPage(page);
    const custCode = SharedDataStore.getOrThrow<string>('reg_td_custCode');
    await tdPage.goto();
    await tdPage.switchToPendingTab();
    const toast = await tdPage.approve(custCode);
    expect(toast).toMatch(/success|authoriz/i);
    if (db.isConnected()) {
      await new TdValidator(db).validateAuthorized(custCode);
    }
  });

  test('04 - Verify: TD in authorized grid', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const tdPage = new TermDepositPage(page);
    await tdPage.goto();
    await tdPage.switchToAuthorizedTab();
    const custCode = SharedDataStore.getOrThrow<string>('reg_td_custCode');
    const row = page.locator('#dt-authdata tbody tr').filter({ hasText: custCode }).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
  });
});
