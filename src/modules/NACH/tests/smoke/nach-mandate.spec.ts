import { test, expect } from '../../../../framework/fixtures/fixtures';
import { NachMandatePage, NachMandateData } from '../../pages/NachMandatePage';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

test.describe('NACH Mandate @smoke @nach', () => {
  let data: NachMandateData;

  test.beforeAll(() => {
    const rows = TestDataLoader.load<NachMandateData>(
      ConfigManager.getTestDataPath('NACH.xlsx'),
      { operation: 'create' },
    );
    data = rows[0];
  });

  test('01 - Maker: Create NACH mandate @create', async ({ makerContext }) => {
    const page = makerContext.pages().find(p => p.url().includes('secure-session'))
              ?? makerContext.pages()[makerContext.pages().length - 1];
    await page.bringToFront();

    const nachPage = new NachMandatePage(page);
    await nachPage.goto();
    await nachPage.openCreateForm();
    const toast = await nachPage.create(data);

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('nach_accountNo', data.accountNo ?? '');
  });

  test('02 - Checker: Authorize NACH mandate @authorize', async ({ checkerContext }) => {
    const page = checkerContext.pages().find(p => p.url().includes('secure-session'))
              ?? checkerContext.pages()[checkerContext.pages().length - 1];
    await page.bringToFront();

    const nachPage  = new NachMandatePage(page);
    const accountNo = SharedDataStore.get<string>('nach_accountNo') ?? data.accountNo ?? '';

    await nachPage.goto();
    await nachPage.switchToPendingTab();
    const toast = await nachPage.authorizeRecord(accountNo);

    expect(toast).toMatch(/success|authoriz/i);
  });
});
