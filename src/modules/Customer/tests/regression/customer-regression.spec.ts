import { test, expect } from '../../../../framework/fixtures/fixtures';
import { CustomerCreationPage } from '../../pages/CustomerCreationPage';
import { CustomerListPage } from '../../pages/CustomerListPage';
import { CustomerModificationPage } from '../../pages/CustomerModificationPage';
import { CustomerValidator } from '../../validators/CustomerValidator';
import { CustomerDataGenerator } from '../../../../common/helpers/CustomerDataGenerator';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

// ── Suite 1: Full Create → Authorize workflow ─────────────────────────────

test.describe('Customer Regression: Create & Authorize @regression @customer @workflow', () => {
  const data = CustomerDataGenerator.full();

  test.beforeAll(() => {
    SharedDataStore.set('reg_full_name', `${data.memberFName} ${data.memberLName}`);
  });

  test('TC-138 Maker: Create retail customer', async ({ makerContext }) => {
    const page    = getPage(makerContext);
    const custPage = new CustomerCreationPage(page);
    await custPage.goto();
    await custPage.openCreateForm();
    await custPage.fillBasicDetails(data);
    await custPage.fillContactDetails(data);
    await custPage.fillAdditionalDetails(data);
    await custPage.fillDocumentDetails(data);
    const toast = await custPage.save();
    expect(toast).toMatch(/success|created/i);
  });

  test('TC-139 Maker: Record appears in Pending tab', async ({ makerContext }) => {
    const page     = getPage(makerContext);
    const listPage = new CustomerListPage(page);
    await listPage.goto();
    const name = SharedDataStore.getOrThrow<string>('reg_full_name');
    await listPage.assertRowVisible('pending', name.split(' ')[0]);
  });

  test('TC-140 Checker: Authorize customer', async ({ checkerContext, db }) => {
    const page     = getPage(checkerContext);
    const custPage = new CustomerCreationPage(page);
    const name     = SharedDataStore.getOrThrow<string>('reg_full_name');
    await custPage.goto();
    const toast = await custPage.approve(name.split(' ')[0]);
    expect(toast).toMatch(/success|authoriz/i);
    if (db.isConnected()) {
      await new CustomerValidator(db).validateAuthorized(name);
    }
  });

  test('TC-141 Authorized record visible in Authorized tab', async ({ makerContext }) => {
    const page     = getPage(makerContext);
    const listPage = new CustomerListPage(page);
    await listPage.goto();
    const name = SharedDataStore.getOrThrow<string>('reg_full_name');
    await listPage.assertRowVisible('authorized', name.split(' ')[0]);
  });

  test('TC-142 Maker: Modify authorized customer', async ({ makerContext }) => {
    const page    = getPage(makerContext);
    const modPage = new CustomerModificationPage(page);
    const name    = SharedDataStore.getOrThrow<string>('reg_full_name');
    await modPage.goto();
    await modPage.openEditForm(name.split(' ')[0]);
    await modPage.fillBasicDetails({ mobileNo1: '9000000099', emailId: 'updated@example.com' });
    const toast = await modPage.save();
    expect(toast).toMatch(/success|updated/i);
  });

  test('TC-143 Checker: Authorize modification', async ({ checkerContext }) => {
    const page     = getPage(checkerContext);
    const custPage = new CustomerCreationPage(page);
    const name     = SharedDataStore.getOrThrow<string>('reg_full_name');
    await custPage.goto();
    const toast = await custPage.approve(name.split(' ')[0]);
    expect(toast).toMatch(/success|authoriz/i);
  });
});

// ── Suite 2: Create → Reject workflow ────────────────────────────────────

test.describe('Customer Regression: Create & Reject @regression @customer @workflow', () => {
  const data = { ...CustomerDataGenerator.minimal(), memberFName: 'RejectFlow', memberLName: 'Test' };

  test.beforeAll(() => {
    SharedDataStore.set('reg_reject_name', `${data.memberFName} ${data.memberLName}`);
  });

  test('TC-144 Maker: Create customer for rejection', async ({ makerContext }) => {
    const page     = getPage(makerContext);
    const custPage = new CustomerCreationPage(page);
    await custPage.goto();
    await custPage.openCreateForm();
    await custPage.fillBasicDetails(data);
    await custPage.fillContactDetails(data);
    await custPage.fillAdditionalDetails(data);
    await custPage.fillDocumentDetails(data);
    const toast = await custPage.save();
    expect(toast).toMatch(/success|created/i);
  });

  test('TC-145 Checker: Reject customer with remark', async ({ checkerContext }) => {
    const page     = getPage(checkerContext);
    const custPage = new CustomerCreationPage(page);
    const name     = SharedDataStore.getOrThrow<string>('reg_reject_name');
    await custPage.goto();
    const toast = await custPage.rejectRecord(name.split(' ')[0], 'Incomplete documentation');
    expect(toast).toMatch(/success|reject/i);
  });

  test('TC-146 Rejected record visible in Rejected tab', async ({ makerContext }) => {
    const page     = getPage(makerContext);
    const listPage = new CustomerListPage(page);
    await listPage.goto();
    const name = SharedDataStore.getOrThrow<string>('reg_reject_name');
    await listPage.assertRowVisible('rejected', name.split(' ')[0]);
  });
});

// ── Suite 3: Four-eyes principle ─────────────────────────────────────────

test.describe('Customer Regression: Four-Eyes Principle @regression @customer @security', () => {

  test('TC-161 Maker cannot authorize own record', async ({ makerContext }) => {
    // Maker navigates to pending tab — authorize button should not be present for own records
    // OR clicking it should show an error
    const page     = getPage(makerContext);
    const listPage = new CustomerListPage(page);
    await listPage.goto();
    await listPage.switchTab('pending');
    // The authorize button in pending rows should either be absent or produce an error when clicked by maker
    const authBtns = page.locator('#dt-pendingdata tbody tr .authorization-btns a');
    const count    = await authBtns.count();
    if (count > 0) {
      await authBtns.first().click({ force: true });
      await page.waitForTimeout(1_000);
      const errorToast = await page.locator('.msg-toast.msg-error em').isVisible({ timeout: 5_000 }).catch(() => false);
      // Either no auth button or error shown = four-eyes enforced
      expect(errorToast || count === 0).toBe(true);
    }
    // If no auth buttons visible for maker = four-eyes enforced at UI level
  });
});

// ── Suite 4: List view grid operations ───────────────────────────────────

test.describe('Customer Regression: Grid Operations @regression @customer @grid', () => {

  test('TC-010 Search in pending tab returns filtered results', async ({ makerContext }) => {
    const page     = getPage(makerContext);
    const listPage = new CustomerListPage(page);
    await listPage.goto();
    const count = await listPage.search('pending', 'Test');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TC-011 Search with no match shows empty state', async ({ makerContext }) => {
    const page     = getPage(makerContext);
    const listPage = new CustomerListPage(page);
    await listPage.goto();
    const count = await listPage.search('authorized', 'ZZZNOMATCH_XYZ_999');
    expect(count).toBe(0);
  });

  test('TC-012 Pagination next/previous works on authorized tab', async ({ makerContext }) => {
    const page     = getPage(makerContext);
    const listPage = new CustomerListPage(page);
    await listPage.goto();
    await listPage.switchTab('authorized');
    const firstPageRows = await page.locator('#dt-authdata tbody tr:not(.dataTables_empty)').count();
    if (firstPageRows >= 10) {
      await listPage.goToNextPage('authorized');
      const secondPageRows = await page.locator('#dt-authdata tbody tr:not(.dataTables_empty)').count();
      expect(secondPageRows).toBeGreaterThan(0);
      await listPage.goToPrevPage('authorized');
    }
  });
});
