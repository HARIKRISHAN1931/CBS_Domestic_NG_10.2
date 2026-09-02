import { test, expect } from '../../../../framework/fixtures/fixtures';
import { KccLoanPage } from '../../pages/KccLoanPage';

test.describe('KCC @smoke @kcc', () => {
  test('01 - Navigate to KCC Loan Sanction @sanity', async ({ authenticatedPage }) => {
    const page = new KccLoanPage(authenticatedPage);
    await page.goto();
    await expect(
      authenticatedPage.locator('#dt-authdata, #dt-pendingdata, #addButton, a.button.add').first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
