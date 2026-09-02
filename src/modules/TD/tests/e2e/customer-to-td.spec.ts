import { test, expect } from '../../../../framework/fixtures/fixtures';
import { CustomerToTdWorkflow } from '../../../../workflows/cross-module/CustomerToTdWorkflow';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { CustomerData } from '../../../Customer/pages/CustomerCreationPage';
import { TDContractData } from '../../pages/TermDepositPage';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

test.describe('Customer → TD E2E @e2e @td @customer', () => {
  test('Full flow: Create customer then open Term Deposit', async ({
    makerContext, checkerContext, db,
  }) => {
    const custData = TestDataLoader.load<CustomerData>(
      ConfigManager.getTestDataPath('Customer.xlsx'),
      { operation: 'create' },
    )[0];

    const tdData = TestDataLoader.load<Omit<TDContractData, 'customerCode'>>(
      ConfigManager.getTestDataPath('TD.xlsx'),
      { operation: 'create' },
    )[0];

    const makerPage   = getPage(makerContext);
    const checkerPage = getPage(checkerContext);

    const result = await new CustomerToTdWorkflow(
      { makerPage, checkerPage, db },
      { customer: custData, td: tdData },
    ).execute();

    expect(result.customerToast).toMatch(/success|authoriz/i);
    expect(result.tdToast).toMatch(/success|authoriz/i);
  });
});
