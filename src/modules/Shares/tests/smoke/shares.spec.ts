import { test, expect } from '../../../../framework/fixtures/fixtures';
import { ShareMemberPage } from '../../pages/ShareMemberPage';

test.describe('Shares @smoke @shares', () => {
  test('01 - Navigate to Share Member Maintenance @sanity', async ({ authenticatedPage }) => {
    const page = new ShareMemberPage(authenticatedPage);
    await page.goto();
    await expect(
      authenticatedPage.locator('#dt-authdata, #dt-pendingdata, #addButton, a.button.add').first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
