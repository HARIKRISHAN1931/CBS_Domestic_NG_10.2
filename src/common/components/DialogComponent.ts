import { Page } from '@playwright/test';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';

export class DialogComponent {
  constructor(private readonly page: Page) {}

  async accept(buttonText = 'OK'): Promise<void> {
    const btn = this.page.locator(`button:has-text("${buttonText}"), .modal-footer button:has-text("${buttonText}")`);
    await btn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await btn.click();
  }

  async dismiss(buttonText = 'Cancel'): Promise<void> {
    const btn = this.page.locator(`button:has-text("${buttonText}"), .modal-footer button:has-text("${buttonText}")`);
    await btn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await btn.click();
  }

  async isVisible(): Promise<boolean> {
    return this.page.locator('.modal, .dialog, [role="dialog"]').isVisible().catch(() => false);
  }
}
