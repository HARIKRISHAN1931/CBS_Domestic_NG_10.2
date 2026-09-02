import { Page } from '@playwright/test';
import { CbsBasePage } from './CbsBasePage';
import { CBS_SELECTORS } from '../config/selectors';
import { CBS_TIMEOUTS } from '../config/timeouts';

export abstract class CbsFormPage extends CbsBasePage {
  constructor(page: Page) { super(page); }

  protected addBtn = () => this.loc(CBS_SELECTORS.ADD_BTN).first();

  async openCreateForm(): Promise<void> {
    await this.click(this.addBtn());
    await this.page.waitForLoadState('domcontentloaded');
  }

  async save(): Promise<string> {
    const primary   = this.loc('button#saveCustomer, button[type="button"].button');
    const secondary = this.loc('a.button.sm.btn-save, #btnSave');
    const saveBtn   = await primary.first().isVisible().catch(() => false)
      ? primary.first()
      : secondary.first();
    await saveBtn.waitFor({ state: 'attached', timeout: CBS_TIMEOUTS.SAVE });
    await saveBtn.click({ force: true });
    await this.modal.confirmSave();
    await this.switchToActivePage();
    return this.toast.getSuccess();
  }

  async authorize(searchText = '', remark = ''): Promise<string> {
    await this.goto();
    await this.grid.clickAuthorize(searchText);
    if (remark) {
      await this.modal.confirmReject(remark);
    } else {
      await this.modal.confirmApprove();
    }
    await this.switchToActivePage();
    return this.toast.getSuccess();
  }
}
