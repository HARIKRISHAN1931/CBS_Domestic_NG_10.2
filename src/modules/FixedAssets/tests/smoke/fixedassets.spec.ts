import { test, expect } from '../../../../framework/fixtures/fixtures';
import { FixedAssetPage } from '../../pages/FixedAssetPage';

test.describe('Fixed Assets @smoke @fixedassets', () => {
  test('01 - Navigate to Fixed Asset Details @sanity', async ({ authenticatedPage }) => {
    const page = new FixedAssetPage(authenticatedPage);
    await page.goto();
    await expect(
      authenticatedPage.locator('#dt-authdata, #dt-pendingdata, #addButton, a.button.add').first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
