import { test, expect } from '../../../../framework/fixtures/fixtures';
import { GoldLoanPage } from '../../pages/GoldLoanPage';

test.describe('Gold Loan @smoke @goldloan', () => {
  test('01 - Navigate to Gold Loan Application @sanity', async ({ authenticatedPage }) => {
    const page = new GoldLoanPage(authenticatedPage);
    await page.goto();
    await expect(
      authenticatedPage.locator('#dt-authdata, #dt-pendingdata, #addButton, a.button.add').first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
