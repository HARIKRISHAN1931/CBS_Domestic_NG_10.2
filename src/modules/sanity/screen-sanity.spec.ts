import { test, expect } from '../../framework/fixtures/fixtures';
import { ScreenRegistry } from '../../framework/config/ScreenRegistry';

/**
 * Screen Sanity Suite — @sanity
 *
 * Auto-generates one test per screen from config/environments/{BANK}-{ENV}/screens.json.
 * Screens disabled in feature-flags.json are skipped automatically.
 * No data entry — read-only, safe on any environment.
 *
 * Run: npx playwright test --grep @sanity
 */

const SCREEN_LOADED_SELECTOR = [
  '#dt-authdata',
  '#dt-pendingdata',
  '.screen-content',
  '.form-panel',
  '#addButton',
  'button.add',
  'a.button.add',
  '.page-title',
  'h3.panel-title',
].join(', ');

const enabledScreenIds = ScreenRegistry.getAllScreenIds().filter(id => ScreenRegistry.isEnabled(id));

test.describe('Screen Sanity @sanity', () => {
  for (const screenId of enabledScreenIds) {
    const title = ScreenRegistry.getTitle(screenId);

    test(`[${screenId}] ${title} @sanity`, async ({ authenticatedPage }) => {
      await ScreenRegistry.navigate(authenticatedPage, screenId);
      await expect(
        authenticatedPage.locator(SCREEN_LOADED_SELECTOR).first(),
      ).toBeVisible({ timeout: 20_000 });
    });
  }
});
