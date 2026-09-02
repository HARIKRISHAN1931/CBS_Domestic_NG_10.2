import { test, expect } from '../../../../framework/fixtures/fixtures';
import { LockerIssuePage, LockerIssueData } from '../../pages/LockerIssuePage';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

test.describe('Locker Issue @smoke @locker', () => {
  let data: LockerIssueData;

  test.beforeAll(() => {
    const rows = TestDataLoader.load<LockerIssueData>(
      ConfigManager.getTestDataPath('Locker.xlsx'),
      { operation: 'create' },
    );
    data = rows[0];
  });

  test('01 - Maker: Issue Locker @create', async ({ makerContext }) => {
    const page = makerContext.pages().find(p => p.url().includes('secure-session'))
              ?? makerContext.pages()[makerContext.pages().length - 1];
    await page.bringToFront();

    const lockerPage = new LockerIssuePage(page);
    await lockerPage.goto();
    await lockerPage.openCreateForm();
    const toast = await lockerPage.create(data);

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('locker_customerCode', data.customerCode ?? '');
  });

  test('02 - Checker: Authorize Locker Issue @authorize', async ({ checkerContext }) => {
    const page = checkerContext.pages().find(p => p.url().includes('secure-session'))
              ?? checkerContext.pages()[checkerContext.pages().length - 1];
    await page.bringToFront();

    const lockerPage   = new LockerIssuePage(page);
    const customerCode = SharedDataStore.get<string>('locker_customerCode') ?? data.customerCode ?? '';

    await lockerPage.goto();
    await lockerPage.switchToPendingTab();
    const toast = await lockerPage.authorizeRecord(customerCode);

    expect(toast).toMatch(/success|authoriz/i);
  });
});
