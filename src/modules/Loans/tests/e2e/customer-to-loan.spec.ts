import { test, expect } from '../../../../framework/fixtures/fixtures';
import { CustomerToLoanWorkflow } from '../../../../workflows/cross-module/CustomerToLoanWorkflow';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { CustomerData } from '../../../Customer/pages/CustomerCreationPage';
import { LoanLimitData } from '../../pages/LoanLimitPage';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

test.describe('Customer → Loan E2E @e2e @loan @customer', () => {
  test('Full flow: Create customer then create Loan Limit', async ({
    makerContext, checkerContext, db,
  }) => {
    const custData = TestDataLoader.load<CustomerData>(
      ConfigManager.getTestDataPath('Customer.xlsx'),
      { operation: 'create' },
    )[0];

    const loanData = TestDataLoader.load<Omit<LoanLimitData, 'customerCode'>>(
      ConfigManager.getTestDataPath('Loans.xlsx'),
      { operation: 'create' },
    )[0];

    const makerPage   = getPage(makerContext);
    const checkerPage = getPage(checkerContext);

    const result = await new CustomerToLoanWorkflow(
      { makerPage, checkerPage, db },
      { customer: custData, loan: loanData },
    ).execute();

    expect(result.customerToast).toMatch(/success|authoriz/i);
    expect(result.loanToast).toMatch(/success|authoriz/i);
  });
});
