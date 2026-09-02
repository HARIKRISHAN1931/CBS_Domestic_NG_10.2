import { test, expect } from '../../../../framework/fixtures/fixtures';
import { PigmyAgentPage } from '../../pages/PigmyAgentPage';

test.describe('Pigmy Daily Deposits @smoke @pigmy', () => {
  test('01 - Navigate to Agent Registration @sanity', async ({ authenticatedPage }) => {
    const page = new PigmyAgentPage(authenticatedPage);
    await page.goto();
    await expect(
      authenticatedPage.locator('#dt-authdata, #dt-pendingdata, #addButton, a.button.add').first(),
    ).toBeVisible({ timeout: 20_000 });
  });
});
