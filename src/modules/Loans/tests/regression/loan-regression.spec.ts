import { test, expect } from '../../../../framework/fixtures/fixtures';
import { LoanLimitPage, LoanLimitData } from '../../pages/LoanLimitPage';
import { LoanValidator } from '../../validators/LoanValidator';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

test.describe('Loan Regression @regression @loan', () => {
  let createData: LoanLimitData;

  test.beforeAll(() => {
    createData = TestDataLoader.load<LoanLimitData>(
      ConfigManager.getTestDataPath('Loans.xlsx'),
      { operation: 'create' },
    )[0];
  });

  test('01 - Maker: Create Loan Limit', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const loanPage = new LoanLimitPage(page);
    await loanPage.goto();
    await loanPage.openCreateForm();
    const toast = await loanPage.create(createData);
    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('reg_loan_custCode', createData.customerCode ?? '');
  });

  test('02 - Verify: Loan in pending grid', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const loanPage = new LoanLimitPage(page);
    await loanPage.goto();
    await loanPage.switchToPendingTab();
    const custCode = SharedDataStore.getOrThrow<string>('reg_loan_custCode');
    const row = page.locator('#dt-pendingdata tbody tr').filter({ hasText: custCode }).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
  });

  test('03 - Checker: Authorize Loan Limit', async ({ checkerContext, db }) => {
    const page = getPage(checkerContext);
    await page.bringToFront();
    const loanPage = new LoanLimitPage(page);
    const custCode = SharedDataStore.getOrThrow<string>('reg_loan_custCode');
    await loanPage.goto();
    await loanPage.switchToPendingTab();
    const toast = await loanPage.authorizeRecord(custCode);
    expect(toast).toMatch(/success|authoriz/i);
    if (db.isConnected()) {
      await new LoanValidator(db).validateAuthorized(custCode);
    }
  });

  test('04 - Verify: Loan in authorized grid', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const loanPage = new LoanLimitPage(page);
    await loanPage.goto();
    await page.locator('#AuthorizedList').click();
    const custCode = SharedDataStore.getOrThrow<string>('reg_loan_custCode');
    const row = page.locator('#dt-authdata tbody tr').filter({ hasText: custCode }).first();
    await expect(row).toBeVisible({ timeout: 10_000 });
  });
});
