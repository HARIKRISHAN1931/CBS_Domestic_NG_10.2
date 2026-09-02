import { test, expect } from '../../../../framework/fixtures/fixtures';
import { AccountOpeningPage } from '../../pages/AccountOpeningPage';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { AccountOpeningFormData } from '../../pages/AccountOpeningPage';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

test.describe('CASA Account Opening @smoke @casa', () => {
  let data: AccountOpeningFormData;

  test.beforeAll(() => {
    const rows = TestDataLoader.load<AccountOpeningFormData>(
      ConfigManager.getTestDataPath('CASA.xlsx'),
      { operation: 'create' },
    );
    data = rows[0];
  });

  test('01 - Maker: Create CASA account @create', async ({ makerContext }) => {
    const pages = makerContext.pages();
    const page  = pages.find(p =>
      p.url().includes('secure-session') ||
      (!p.url().includes('LoginPage') && p.url() !== 'about:blank'),
    ) ?? pages[pages.length - 1];
    await page.bringToFront();

    const casaPage = new AccountOpeningPage(page);
    await casaPage.goto();
    await casaPage.openCreateForm();
    const toast = await casaPage.create(data);

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('casa_customerNumber', data.customerNumber);
  });

  test('02 - Checker: Authorize CASA account @authorize', async ({ checkerContext }) => {
    const pages = checkerContext.pages();
    const page  = pages.find(p =>
      p.url().includes('secure-session') ||
      (!p.url().includes('LoginPage') && p.url() !== 'about:blank'),
    ) ?? pages[pages.length - 1];
    await page.bringToFront();

    const casaPage       = new AccountOpeningPage(page);
    const customerNumber = SharedDataStore.get<string>('casa_customerNumber') ?? data.customerNumber;

    await casaPage.goto();
    await casaPage.switchToPendingTab();
    const toast = await casaPage.approve(customerNumber!);

    expect(toast).toMatch(/success|authoriz/i);
  });
});
