import { test, expect } from '../../../../framework/fixtures/fixtures';
import { RtgsNeftEntryPage, RtgsNeftEntryData } from '../../pages/RtgsNeftEntryPage';
import { RtgsValidator } from '../../validators/RtgsValidator';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

test.describe('RTGS Regression @regression @rtgs', () => {
  let createData: RtgsNeftEntryData;

  test.beforeAll(() => {
    createData = TestDataLoader.load<RtgsNeftEntryData>(
      ConfigManager.getTestDataPath('RTGS.xlsx'),
      { operation: 'create' },
    )[0];
  });

  test('01 - Maker: Create RTGS entry', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const rtgsPage = new RtgsNeftEntryPage(page);
    await rtgsPage.goto();
    await rtgsPage.openCreateForm();
    await rtgsPage.fillForm(createData);
    const toast = await rtgsPage.save();
    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('reg_rtgs_acct', createData.rtgsNeftAcctId ?? '');
  });

  test('02 - Checker: Authorize RTGS entry', async ({ checkerContext, db }) => {
    const page = getPage(checkerContext);
    await page.bringToFront();
    const rtgsPage = new RtgsNeftEntryPage(page);
    const acct = SharedDataStore.getOrThrow<string>('reg_rtgs_acct');
    await rtgsPage.goto();
    const toast = await rtgsPage.approve(acct);
    expect(toast).toMatch(/success|authoriz/i);
    if (db.isConnected()) {
      await new RtgsValidator(db).validateAuthorized(acct);
    }
  });
});
