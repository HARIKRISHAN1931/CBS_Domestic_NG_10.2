import { test, expect } from '../../../../framework/fixtures/fixtures';
import { RtgsNeftEntryPage, RtgsNeftEntryData } from '../../../RTGS/pages/RtgsNeftEntryPage';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

/**
 * NEFT uses the same screen as RTGS (TRANSACTIONMST).
 * The msgTrfType field in test data selects NEFT vs RTGS.
 * NEFT outward authorization uses screenId NEFTOUT.
 */
test.describe('NEFT Entry @smoke @neft', () => {
  let data: RtgsNeftEntryData;

  test.beforeAll(() => {
    const rows = TestDataLoader.load<RtgsNeftEntryData>(
      ConfigManager.getTestDataPath('NEFT.xlsx'),
      { operation: 'create' },
    );
    data = rows[0];
  });

  test('01 - Maker: Create NEFT entry @create', async ({ makerContext }) => {
    const page = makerContext.pages().find(p => p.url().includes('secure-session'))
              ?? makerContext.pages()[makerContext.pages().length - 1];
    await page.bringToFront();

    const neftPage = new RtgsNeftEntryPage(page);
    await neftPage.goto();
    await neftPage.openCreateForm();
    const toast = await neftPage.fillForm(data).then(() => neftPage.save());

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('neft_searchKey', data.searchKey ?? data.rtgsNeftAcctId ?? '');
  });

  test('02 - Checker: Authorize NEFT entry @authorize', async ({ checkerContext }) => {
    const page = checkerContext.pages().find(p => p.url().includes('secure-session'))
              ?? checkerContext.pages()[checkerContext.pages().length - 1];
    await page.bringToFront();

    const neftPage  = new RtgsNeftEntryPage(page);
    const searchKey = SharedDataStore.get<string>('neft_searchKey') ?? data.searchKey ?? '';

    await neftPage.goto();
    const toast = await neftPage.approve(searchKey);

    expect(toast).toMatch(/success|authoriz/i);
  });
});
