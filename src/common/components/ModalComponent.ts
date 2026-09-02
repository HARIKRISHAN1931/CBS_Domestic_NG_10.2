import { Page } from '@playwright/test';
import { CBS_SELECTORS } from '../../framework/config/selectors';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';

export class ModalComponent {
  constructor(private readonly page: Page) {}

  async confirmSave(): Promise<void> {
    const confirmBtn = this.page.locator(CBS_SELECTORS.CONFIRM_SAVE_BTN);
    const visible    = await confirmBtn.isVisible({ timeout: CBS_TIMEOUTS.SHORT }).catch(() => false);
    if (visible) await confirmBtn.click();
  }

  async confirmApprove(): Promise<void> {
    const approveBtn = this.page.locator(CBS_SELECTORS.APPROVE_BTN);
    await approveBtn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await approveBtn.click();
    const confirmBtn = this.page.locator(CBS_SELECTORS.CONFIRM_APPROVE);
    await confirmBtn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await confirmBtn.click();
  }

  async confirmReject(remark: string): Promise<void> {
    const rejectBtn = this.page.locator(CBS_SELECTORS.REJECT_BTN);
    await rejectBtn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await rejectBtn.click();
    const remarkInput = this.page.locator(CBS_SELECTORS.REJECT_REMARK);
    await remarkInput.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await remarkInput.fill(remark);
    const confirmBtn = this.page.locator(CBS_SELECTORS.CONFIRM_REJECT);
    await confirmBtn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await confirmBtn.click();
  }
}
