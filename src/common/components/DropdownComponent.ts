import { Page, Locator } from '@playwright/test';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';

export class DropdownComponent {
  constructor(private readonly page: Page) {}

  async select(locator: Locator, value: string): Promise<void> {
    if (!value) return;
    await locator.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    const done = await locator.selectOption(value.trim()).then(() => true).catch(() => false);
    if (!done) await locator.selectOption({ label: value.trim() }).catch(() => {});
  }

  async selectById(fieldId: string, value: string): Promise<void> {
    await this.select(this.page.locator(`#${fieldId}`), value);
  }

  async getSelectedText(locator: Locator): Promise<string> {
    return locator.evaluate((el: HTMLSelectElement) =>
      el.options[el.selectedIndex]?.text ?? ''
    );
  }
}
