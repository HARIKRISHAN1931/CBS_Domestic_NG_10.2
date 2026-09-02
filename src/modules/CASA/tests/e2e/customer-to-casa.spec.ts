import { test, expect } from '../../../../framework/fixtures/fixtures';
import { CustomerToCasaWorkflow } from '../../../../workflows/cross-module/CustomerToCasaWorkflow';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { CustomerData } from '../../../Customer/pages/CustomerCreationPage';
import { AccountOpeningFormData } from '../../pages/AccountOpeningPage';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

test.describe('Customer → CASA E2E @e2e @casa @customer', () => {
  test('Full flow: Create customer then open CASA account', async ({
    makerContext, checkerContext, db,
  }) => {
    const file = ConfigManager.getTestDataPath('Customer.xlsx');
    const custData = TestDataLoader.load<CustomerData>(file, { operation: 'create' })[0];

    const casaFile = ConfigManager.getTestDataPath('CASA.xlsx');
    const casaData = TestDataLoader.load<Omit<AccountOpeningFormData, 'customerNumber'>>(
      casaFile, { operation: 'create' },
    )[0];

    const makerPage   = getPage(makerContext);
    const checkerPage = getPage(checkerContext);

    const result = await new CustomerToCasaWorkflow(
      { makerPage, checkerPage, db },
      { customer: custData, casa: casaData },
    ).execute();

    expect(result.customerToast).toMatch(/success|authoriz/i);
    expect(result.casaToast).toMatch(/success|authoriz/i);
  });
});
