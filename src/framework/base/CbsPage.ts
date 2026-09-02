import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { CBS_SELECTORS } from '../config/selectors';
import { CBS_TIMEOUTS } from '../config/timeouts';

/**
 * Single base class for all CBS screen page objects.
 * Replaces CbsBasePage + CbsFormPage + CbsAuthPage + CbsUpdatePage.
 *
 * Each subclass declares only:
 *   protected readonly screenId = 'PRDACNOMST';
 *
 * Navigation is always via ScreenRegistry.navigate(page, screenId) —
 * never hardcoded menu paths.
 */
export abstract class CbsPage extends BasePage {
  protected abstract readonly screenId: string;

  constructor(page: Page) { super(page); }

  async goto(): Promise<void> {
    // Lazy import avoids circular dependency (ScreenRegistry → MenuNavigation → CbsPage)
    const { ScreenRegistry } = await import('../config/ScreenRegistry');
    await ScreenRegistry.navigate(this.page, this.screenId);
  }

  async openCreateForm(): Promise<void> {
    const btn = this.loc('a.button.add, button.add, #addButton, #btnAddAccount').first();
    await btn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await btn.click({ force: true });
    await this.page.waitForLoadState('domcontentloaded');
  }

  async save(): Promise<string> {
    const btn = this.loc(CBS_SELECTORS.SAVE_BTN).first();
    await btn.waitFor({ state: 'attached', timeout: CBS_TIMEOUTS.SAVE });
    await btn.click({ force: true });
    await this.modal.confirmSave();
    await this.switchToActivePage();
    return this.toast.getSuccess();
  }

  async openEditForm(searchText: string): Promise<void> {
    await this.grid.searchAndEdit(searchText, 'authorized');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async authorizeRecord(searchText = '', remark = ''): Promise<string> {
    await this.grid.switchTab('pending');
    await this.grid.clickAuthorize(searchText);
    remark
      ? await this.modal.confirmReject(remark)
      : await this.modal.confirmApprove();
    await this.switchToActivePage();
    return this.toast.getSuccess();
  }

  async rejectRecord(searchText: string, remark: string): Promise<string> {
    return this.authorizeRecord(searchText, remark);
  }
}
