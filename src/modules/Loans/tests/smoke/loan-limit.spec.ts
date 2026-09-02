import { test, expect } from '../../../../framework/fixtures/fixtures';
import { LoanLimitPage, LoanLimitData } from '../../pages/LoanLimitPage';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

test.describe('Loan Limit @smoke @loan', () => {
  let data: LoanLimitData;

  test.beforeAll(() => {
    const rows = TestDataLoader.load<LoanLimitData>(
      ConfigManager.getTestDataPath('Loans.xlsx'),
      { operation: 'create' },
    );
    data = rows[0];
  });

  test('01 - Maker: Create Loan Limit @create', async ({ makerContext }) => {
    const page = makerContext.pages().find(p => p.url().includes('secure-session'))
              ?? makerContext.pages()[makerContext.pages().length - 1];
    await page.bringToFront();

    const loanPage = new LoanLimitPage(page);
    await loanPage.goto();
    await loanPage.openCreateForm();
    const toast = await loanPage.create(data);

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('loan_customerCode', data.customerCode ?? '');
  });

  test('02 - Checker: Authorize Loan Limit @authorize', async ({ checkerContext }) => {
    const page = checkerContext.pages().find(p => p.url().includes('secure-session'))
              ?? checkerContext.pages()[checkerContext.pages().length - 1];
    await page.bringToFront();

    const loanPage     = new LoanLimitPage(page);
    const customerCode = SharedDataStore.get<string>('loan_customerCode') ?? data.customerCode ?? '';

    await loanPage.goto();
    await loanPage.switchToPendingTab();
    const toast = await loanPage.authorizeRecord(customerCode);

    expect(toast).toMatch(/success|authoriz/i);
  });
});
