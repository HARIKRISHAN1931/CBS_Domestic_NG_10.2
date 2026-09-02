import { Page } from '@playwright/test';
import { CbsBasePage } from './CbsBasePage';
import { CBS_SELECTORS } from '../config/selectors';
import { CBS_TIMEOUTS } from '../config/timeouts';

/**
 * Base for auth-only screens (checker role) — navigates to pending tab and authorizes.
 */
export abstract class CbsAuthPage extends CbsBasePage {
  constructor(page: Page) { super(page); }

  async authorizeRecord(searchText = '', remark = ''): Promise<string> {
    await this.goto();
    await this.grid.switchTab('pending');
    await this.grid.clickAuthorize(searchText);
    if (remark) {
      await this.modal.confirmReject(remark);
    } else {
      await this.modal.confirmApprove();
    }
    await this.switchToActivePage();
    return this.toast.getSuccess();
  }

  async rejectRecord(searchText: string, remark: string): Promise<string> {
    return this.authorizeRecord(searchText, remark);
  }
}
