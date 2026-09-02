import { Page } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';
import { CBS_TIMEOUTS } from '../../../framework/config/timeouts';

export class DayEndProcessPage extends CbsPage {
  protected readonly screenId = 'DAYENDPROCESS';

  constructor(page: Page) { super(page); }

  async runEOD(): Promise<string> {
    const runBtn = this.page.locator('#btnRunEOD, #runEOD, button:has-text("Run"), button:has-text("Execute")').first();
    await runBtn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await runBtn.click();
    await this.modal.confirmSave();
    return this.toast.getSuccess(CBS_TIMEOUTS.PROCESS);
  }

  async getProcessStatus(): Promise<string> {
    const status = this.page.locator('#processStatus, .process-status, td.status').first();
    await status.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT }).catch(() => {});
    return status.innerText().catch(() => '');
  }

  async waitForCompletion(timeoutMs = CBS_TIMEOUTS.EOD): Promise<void> {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const status = await this.getProcessStatus();
      if (/complet|success/i.test(status)) return;
      if (/fail|error/i.test(status)) throw new Error(`EOD failed: ${status}`);
      await this.page.waitForTimeout(5_000);
    }
    throw new Error('EOD timed out');
  }
}
