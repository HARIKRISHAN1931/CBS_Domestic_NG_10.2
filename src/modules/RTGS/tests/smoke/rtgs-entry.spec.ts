import { test, expect } from '../../../../framework/fixtures/fixtures';
import { RtgsNeftEntryPage, RtgsNeftEntryData } from '../../pages/RtgsNeftEntryPage';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

test.describe('RTGS Entry @smoke @rtgs', () => {
  let data: RtgsNeftEntryData;

  test.beforeAll(() => {
    const rows = TestDataLoader.load<RtgsNeftEntryData>(
      ConfigManager.getTestDataPath('RTGS.xlsx'),
      { operation: 'create' },
    );
    data = rows[0];
  });

  test('01 - Maker: Create RTGS entry @create', async ({ makerContext }) => {
    const page = makerContext.pages().find(p => p.url().includes('secure-session'))
              ?? makerContext.pages()[makerContext.pages().length - 1];
    await page.bringToFront();

    const rtgsPage = new RtgsNeftEntryPage(page);
    await rtgsPage.goto();
    await rtgsPage.openCreateForm();
    const toast = await rtgsPage.fillForm(data).then(() => rtgsPage.save());

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('rtgs_searchKey', data.searchKey ?? data.rtgsNeftAcctId ?? '');
  });

  test('02 - Checker: Authorize RTGS entry @authorize', async ({ checkerContext }) => {
    const page = checkerContext.pages().find(p => p.url().includes('secure-session'))
              ?? checkerContext.pages()[checkerContext.pages().length - 1];
    await page.bringToFront();

    const rtgsPage  = new RtgsNeftEntryPage(page);
    const searchKey = SharedDataStore.get<string>('rtgs_searchKey') ?? data.searchKey ?? '';

    await rtgsPage.goto();
    const toast = await rtgsPage.approve(searchKey);

    expect(toast).toMatch(/success|authoriz/i);
  });
});
