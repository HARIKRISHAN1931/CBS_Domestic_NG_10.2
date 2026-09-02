import { Page } from '@playwright/test';
import { CbsBasePage } from './CbsBasePage';
import { CBS_SELECTORS } from '../config/selectors';
import { CBS_TIMEOUTS } from '../config/timeouts';

/**
 * Base for update/edit screens — navigates to authorized tab, searches, opens edit form.
 */
export abstract class CbsUpdatePage extends CbsBasePage {
  constructor(page: Page) { super(page); }

  async openEditForm(searchText: string): Promise<void> {
    await this.goto();
    await this.grid.searchAndEdit(searchText, 'authorized');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async saveUpdate(): Promise<string> {
    const saveBtn = this.loc(CBS_SELECTORS.SAVE_BTN).first();
    await saveBtn.waitFor({ state: 'attached', timeout: CBS_TIMEOUTS.SAVE });
    await saveBtn.click({ force: true });
    await this.modal.confirmSave();
    await this.switchToActivePage();
    return this.toast.getSuccess();
  }
}
