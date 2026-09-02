import { Page, Locator } from '@playwright/test';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';

export class CalendarComponent {
  constructor(private readonly page: Page) {}

  async selectDate(inputLocator: Locator, date: string): Promise<void> {
    await inputLocator.clear();
    await inputLocator.fill(date);
    await inputLocator.press('Tab');
    await this.page.waitForTimeout(300);
  }

  async selectDateById(fieldId: string, date: string): Promise<void> {
    const input = this.page.locator(`#${fieldId}`);
    await input.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await this.selectDate(input, date);
  }
}
