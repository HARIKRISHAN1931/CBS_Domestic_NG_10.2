import { test, expect } from '../../../../framework/fixtures/fixtures';
import { CcodPage } from '../../pages/CcodPage';

test.describe('CCOD @smoke @ccod', () => {
  test('01 - Navigate to CCOD Adhoc Limit screen @sanity', async ({ authenticatedPage }) => {
    const ccodPage = new CcodPage(authenticatedPage);
    await ccodPage.goto();
    await expect(
      authenticatedPage.locator('#dt-authdata, #dt-pendingdata, #addButton, a.button.add').first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
