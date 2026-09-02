import { Page } from '@playwright/test';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';

export interface CascadeStep { id: string; value: string; }

/**
 * Selects a chain of dependent dropdowns in sequence, waiting for AJAX after each.
 * Handles both native <select> and Select2 widgets.
 */
export class CascadeHelper {
  static async select(page: Page, steps: CascadeStep[]): Promise<void> {
    for (const { id, value } of steps) {
      if (!value) continue;
      const el = page.locator(`#${id}`);
      const ok = await el.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT }).then(() => true).catch(() => false);
      if (!ok) continue;

      const isSelect2 = await page.locator(`#select2-${id}-container`).isVisible({ timeout: 1_000 }).catch(() => false);
      if (isSelect2) {
        await page.locator(`#select2-${id}-container`).click();
        const search = page.locator('.select2-search__field').last();
        if (await search.isVisible({ timeout: 1_000 }).catch(() => false)) await search.fill(value);
        const opt = page.locator('.select2-results__option').filter({ hasText: value }).first();
        if (await opt.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await opt.click();
        } else {
          await page.keyboard.press('Escape');
          await el.selectOption(value).catch(() => el.selectOption({ label: value }).catch(() => {}));
        }
      } else {
        const done = await el.selectOption(value).then(() => true).catch(() => false);
        if (!done) await el.selectOption({ label: value }).catch(() => {});
      }
      await page.waitForLoadState('networkidle').catch(() => page.waitForTimeout(800));
    }
  }
}
