import { test, expect } from '../../../../framework/fixtures/fixtures';
import { DayEndProcessPage } from '../../pages/DayEndProcessPage';

test.describe('Day End Process @smoke @eod', () => {
  test('01 - Navigate to EOD screen @sanity', async ({ authenticatedPage }) => {
    const eodPage = new DayEndProcessPage(authenticatedPage);
    await eodPage.goto();

    // Verify the EOD screen loaded — look for run button or process status
    const screenLoaded = authenticatedPage.locator([
      '#btnRunEOD',
      '#runEOD',
      '.process-status',
      '#dt-authdata',
      '#dt-pendingdata',
      'button:has-text("Run")',
      'button:has-text("Execute")',
    ].join(', ')).first();

    await expect(screenLoaded).toBeVisible({ timeout: 20_000 });
  });
});
