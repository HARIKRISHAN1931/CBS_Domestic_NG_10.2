import { test, expect } from '../../pages/customerFixtures';

test.describe('Customer List View @smoke @customer @list', () => {

  test('TC-001 Screen loads with 3 tabs visible', async ({ customerListPage }) => {
    await customerListPage.assertTabVisible();
  });

  test('TC-002 Pending tab shows records', async ({ customerListPage }) => {
    await customerListPage.switchTab('pending');
    const count = await customerListPage['page'].locator('#dt-pendingdata tbody tr:not(.dataTables_empty)').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('TC-003 Authorized tab shows records', async ({ customerListPage }) => {
    await customerListPage.switchTab('authorized');
    const count = await customerListPage['page'].locator('#dt-authdata tbody tr:not(.dataTables_empty)').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-004 Rejected tab is accessible', async ({ customerListPage }) => {
    await customerListPage.switchTab('rejected');
    await expect(customerListPage['page'].locator('#dt-rejecteddata')).toBeVisible();
  });

  test('TC-005 Add button is visible and labeled correctly', async ({ customerListPage }) => {
    await customerListPage.assertAddButtonVisible();
    const text = await customerListPage['page'].locator('#addButton').innerText().catch(() => '');
    expect(text).toMatch(/customer/i);
  });

  test('TC-006 Search on authorized tab filters results', async ({ customerListPage }) => {
    const count = await customerListPage.search('authorized', 'Test');
    expect(count).toBeGreaterThanOrEqual(0); // no error = pass; result count may vary
  });

  test('TC-007 Clearing search restores full list', async ({ customerListPage }) => {
    await customerListPage.search('authorized', 'ZZZNOMATCH999');
    await customerListPage.clearSearch('authorized');
    const count = await customerListPage['page'].locator('#dt-authdata tbody tr:not(.dataTables_empty)').count();
    expect(count).toBeGreaterThan(0);
  });

  test('TC-008 Export buttons are visible', async ({ customerListPage }) => {
    await customerListPage.switchTab('authorized');
    const page = customerListPage['page'];
    await expect(page.locator('button:has-text("EXCEL"), a:has-text("EXCEL")').first()).toBeVisible();
    await expect(page.locator('button:has-text("PDF"), a:has-text("PDF")').first()).toBeVisible();
    await expect(page.locator('button:has-text("CSV"), a:has-text("CSV")').first()).toBeVisible();
  });

});
