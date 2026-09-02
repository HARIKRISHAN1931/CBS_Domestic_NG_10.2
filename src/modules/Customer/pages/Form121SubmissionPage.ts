import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface Form121Data extends Record<string, unknown> {
  memberCode?:               string;
  form121YN?:                'Y' | 'N';
  tdsYN?:                    'Y' | 'N';
  TDSReason?:                string;
  submitDate?:               string;
  form121FilledOtherBankYN?: 'Y' | 'N';
  NoOf15GH?:                 string;
  amtOf15GHOthBnk?:          string;
  aggrIncome?:               string;
  estIncome?:                string;
  estimatedIncome?:          string;
  prevYearFiled1YN?:         'Y' | 'N';
  prevAssessYear1?:          string;
  acknowledgementNo1?:       string;
  returnIncome1?:            string;
  prevYearFiled2YN?:         'Y' | 'N';
  prevAssessYear2?:          string;
  acknowledgementNo2?:       string;
  returnIncome2?:            string;
  searchKey?:                string;
}

export class Form121SubmissionPage extends CbsPage {
  protected readonly screenId = 'CUSTOMER';

  constructor(page: Page) { super(page); }

  private v   = (id: string): Locator => this.loc(`#${id}`);
  private async inp(id: string, val: string)  { if (val) await this.fill(this.v(id), val); }
  private async sel(id: string, val: string)  { if (val) await this.selectOption(this.v(id), val); await this.waitForAjax(); }
  private async vis(id: string)               { return this.v(id).isVisible().catch(() => false); }
  private async enabled(id: string)           { return this.v(id).isEnabled().catch(() => false); }
  private async radio(id: string): Promise<void> {
    const el = this.v(id);
    await el.scrollIntoViewIfNeeded().catch(() => {});
    if (await el.isEnabled().catch(() => false)) { await el.click({ force: true }); await this.waitForAjax(); }
  }

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton, button.add, #createButton').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await addBtn.click({ force: true });
    await this.v('memberCode').waitFor({ state: 'visible', timeout: 20_000 });
    await this.waitForAjax();
  }

  async fillForm(data: Form121Data): Promise<void> {
    if (data.memberCode) {
      await this.v('memberCode').waitFor({ state: 'visible', timeout: 10_000 });
      await this.v('memberCode').fill(data.memberCode);
      await this.v('memberCode').press('Tab');
      await this.waitForAjax();
      await this.page.waitForTimeout(1_000);
    }
    if (data.form121YN === 'Y') await this.radio('form121Y');
    if (data.form121YN === 'N') await this.radio('form121N');
    if (data.tdsYN === 'Y') await this.radio('isTdsY');
    if (data.tdsYN === 'N') await this.radio('isTdsN');
    if (data.TDSReason && await this.vis('TDSReason') && await this.enabled('TDSReason')) await this.sel('TDSReason', data.TDSReason);
    if (data.submitDate && await this.vis('submitDate') && await this.enabled('submitDate')) { await this.inp('submitDate', data.submitDate); await this.v('submitDate').press('Tab'); await this.waitForAjax(); }
    if (data.form121FilledOtherBankYN === 'Y') await this.radio('form121FilledOtherBankY');
    if (data.form121FilledOtherBankYN === 'N') await this.radio('form121FilledOtherBankN');
    if (data.NoOf15GH && await this.vis('NoOf15GH') && await this.enabled('NoOf15GH')) await this.inp('NoOf15GH', data.NoOf15GH);
    if (data.amtOf15GHOthBnk && await this.vis('amtOf15GHOthBnk_txt') && await this.enabled('amtOf15GHOthBnk_txt')) { await this.inp('amtOf15GHOthBnk_txt', data.amtOf15GHOthBnk); await this.v('amtOf15GHOthBnk_txt').press('Tab'); }
    if (data.aggrIncome && await this.vis('aggrIncome_txt') && await this.enabled('aggrIncome_txt')) { await this.inp('aggrIncome_txt', data.aggrIncome); await this.v('aggrIncome_txt').press('Tab'); }
    if (data.estIncome && await this.vis('estIncome_txt') && await this.enabled('estIncome_txt')) { await this.inp('estIncome_txt', data.estIncome); await this.v('estIncome_txt').press('Tab'); }
    if (data.prevYearFiled1YN) await this.sel('prevYearFiled1YN', data.prevYearFiled1YN);
    if (data.prevAssessYear1   && await this.enabled('prevAssessYear1'))   await this.inp('prevAssessYear1',   data.prevAssessYear1);
    if (data.acknowledgementNo1 && await this.enabled('acknowledgementNo1')) await this.inp('acknowledgementNo1', data.acknowledgementNo1);
    if (data.returnIncome1 && await this.vis('returnIncome1_txt') && await this.enabled('returnIncome1_txt')) { await this.inp('returnIncome1_txt', data.returnIncome1); await this.v('returnIncome1_txt').press('Tab'); }
    if (data.prevYearFiled2YN) await this.sel('prevYearFiled2YN', data.prevYearFiled2YN);
    if (data.prevAssessYear2   && await this.enabled('prevAssessYear2'))   await this.inp('prevAssessYear2',   data.prevAssessYear2);
    if (data.acknowledgementNo2 && await this.enabled('acknowledgementNo2')) await this.inp('acknowledgementNo2', data.acknowledgementNo2);
    if (data.returnIncome2 && await this.vis('returnIncome2_txt') && await this.enabled('returnIncome2_txt')) { await this.inp('returnIncome2_txt', data.returnIncome2); await this.v('returnIncome2_txt').press('Tab'); }
  }

  async save(): Promise<string> {
    const btn = this.page.locator('#saveD020220, #saveDepositeparamDetails, #saveCustomerDetails, button[id*="save"]').filter({ visible: true }).first();
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    await this.modal.confirmSave();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`[CBS] ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }

  async approve(searchKey: string, tab = 'pending'): Promise<string> {
    await this.grid.switchTab(tab as any);
    await this.grid.clickAuthorize(searchKey);
    await this.modal.confirmApprove();
    await this.switchToActivePage();
    return this.toast.getSuccess();
  }
}
