import { Page, Locator } from '@playwright/test';
import { CBS_SELECTORS } from '../../framework/config/selectors';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';
import { logger } from '../../framework/logger/logger';

export class ToastComponent {
  constructor(private readonly page: Page) {}

  private get successLoc(): Locator { return this.page.locator(CBS_SELECTORS.TOAST_SUCCESS); }
  private get errorLoc():   Locator { return this.page.locator(CBS_SELECTORS.TOAST_ERROR); }

  async getSuccess(timeout: number = CBS_TIMEOUTS.TOAST): Promise<string> {
    await this.successLoc.waitFor({ state: 'visible', timeout });
    const text = (await this.successLoc.innerText()).trim();
    logger.pass(`Toast success: "${text.replace(/[\r\n]/g, ' ')}"`);
    return text;
  }

  async getError(timeout: number = CBS_TIMEOUTS.ELEMENT): Promise<string> {
    await this.errorLoc.waitFor({ state: 'visible', timeout });
    const text = (await this.errorLoc.innerText()).trim();
    logger.warn(`Toast error: "${text.replace(/[\r\n]/g, ' ')}"`);
    return text;
  }

  async assertNoError(timeout: number = CBS_TIMEOUTS.SHORT): Promise<void> {
    const visible = await this.errorLoc.isVisible({ timeout }).catch(() => false);
    if (visible) {
      const text = await this.errorLoc.innerText().catch(() => '');
      throw new Error(`[UI] Unexpected error toast: "${text.replace(/[\r\n]/g, ' ')}"`);
    }
  }
}
