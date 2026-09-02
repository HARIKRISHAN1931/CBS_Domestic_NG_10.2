import { test, expect } from '../../../../framework/fixtures/fixtures';
import { ClearingPage } from '../../pages/ClearingPage';

test.describe('Clearing @smoke @clearing', () => {
  test('01 - Navigate to Outward Clearing screen @sanity', async ({ authenticatedPage }) => {
    const page = new ClearingPage(authenticatedPage);
    await page.goto();
    await expect(
      authenticatedPage.locator('#dt-authdata, #dt-pendingdata, #addButton, a.button.add, .screen-content').first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
