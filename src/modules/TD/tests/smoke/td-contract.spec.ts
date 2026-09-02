import { test, expect } from '../../../../framework/fixtures/fixtures';
import { TermDepositPage, TDContractData } from '../../pages/TermDepositPage';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

test.describe('Term Deposit Contract @smoke @td', () => {
  let data: TDContractData;

  test.beforeAll(() => {
    const rows = TestDataLoader.load<TDContractData>(
      ConfigManager.getTestDataPath('TD.xlsx'),
      { operation: 'create' },
    );
    data = rows[0];
  });

  test('01 - Maker: Create TD contract @create', async ({ makerContext }) => {
    const page = makerContext.pages().find(p => p.url().includes('secure-session'))
              ?? makerContext.pages()[makerContext.pages().length - 1];
    await page.bringToFront();

    const tdPage = new TermDepositPage(page);
    await tdPage.goto();
    await tdPage.openCreateForm();
    const toast = await tdPage.create(data);

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('td_customerCode', data.customerCode);
  });

  test('02 - Checker: Authorize TD contract @authorize', async ({ checkerContext }) => {
    const page = checkerContext.pages().find(p => p.url().includes('secure-session'))
              ?? checkerContext.pages()[checkerContext.pages().length - 1];
    await page.bringToFront();

    const tdPage       = new TermDepositPage(page);
    const customerCode = SharedDataStore.get<string>('td_customerCode') ?? data.customerCode;

    await tdPage.goto();
    await tdPage.switchToPendingTab();
    const toast = await tdPage.approve(customerCode);

    expect(toast).toMatch(/success|authoriz/i);
  });
});
