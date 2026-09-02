import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';
import { CustomerData } from './CustomerCreationPage';

export class CustomerModificationPage extends CbsPage {
  protected readonly screenId = 'CUSTOMER';

  constructor(page: Page) { super(page); }

  private v  = (id: string): Locator => this.loc(`#${id}`);
  private async sel(id: string, val: string)  { if (val) await this.selectOption(this.v(id), val); await this.waitForAjax(); }
  private async inp(id: string, val: string)  { if (val) await this.fill(this.v(id), val); }
  private async radio(id: string)             { const el = this.v(id); await el.scrollIntoViewIfNeeded().catch(() => {}); if (await el.isEnabled().catch(() => false)) { await el.click(); await this.waitForAjax(); } }
  private async vis(id: string)               { return this.v(id).isVisible().catch(() => false); }

  private async sel2(id: string, value: string) {
    const container = this.loc(`#select2-${id}-container`).first();
    if (await container.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await container.click();
      const search = this.loc('.select2-search__field').last();
      if (await search.isVisible({ timeout: 1_000 }).catch(() => false)) await search.fill(value);
      const opt = this.loc('.select2-results__option').filter({ hasText: value }).first();
      if (await opt.isVisible({ timeout: 2_000 }).catch(() => false)) { await opt.click(); await this.waitForAjax(); return; }
      await this.page.keyboard.press('Escape');
    }
    await this.v(id).selectOption(value).catch(() => {});
    await this.waitForAjax();
  }

  private async clickNext(anchorId?: string): Promise<void> {
    const btn = this.loc('#nextBtn');
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    await this.page.waitForLoadState('domcontentloaded').catch(() => {});
    if (anchorId) await this.loc(`#${anchorId}`).waitFor({ state: 'attached', timeout: 20_000 });
    await this.waitForAjax();
  }

  async openEditForm(searchKey: string, tab: 'authorized' | 'pending' = 'authorized'): Promise<void> {
    await this.grid.searchAndEdit(searchKey, tab);
    await this.v('memberFName').waitFor({ state: 'visible', timeout: 20_000 });
    await this.waitForAjax();
  }

  async fillBasicDetails(data: Partial<CustomerData>): Promise<void> {
    if (data.nameTitle        && await this.vis('nameTitle'))        await this.sel('nameTitle',        data.nameTitle);
    if (data.memberFName      && await this.vis('memberFName'))      await this.inp('memberFName',      data.memberFName);
    if (data.memberMName      && await this.vis('memberMName'))      await this.inp('memberMName',      data.memberMName);
    if (data.memberLName      && await this.vis('memberLName'))      await this.inp('memberLName',      data.memberLName);
    if (data.memberDOB        && await this.vis('memberDOB'))        { await this.inp('memberDOB', data.memberDOB); await this.v('memberDOB').press('Tab'); await this.waitForAjax(); }
    if (data.memberGender     && await this.vis('memberGender'))     await this.sel('memberGender',     data.memberGender);
    if (data.nationality      && await this.vis('nationality'))      await this.sel('nationality',      data.nationality);
    if (data.mbrMaritalStatus && await this.vis('mbrMaritalStatus')) await this.sel('mbrMaritalStatus', data.mbrMaritalStatus);
    if (data.pan              && await this.vis('pan'))              await this.inp('pan',              data.pan);
    if (data.memberMonthlyInc && await this.vis('memberMonthlyInc')) await this.inp('memberMonthlyInc', data.memberMonthlyInc);
  }

  async fillContactDetails(data: Partial<CustomerData>): Promise<void> {
    await this.clickNext('addressType');
    if (data.address1  && await this.vis('address1'))  await this.inp('address1',  data.address1);
    if (data.address2  && await this.vis('address2'))  await this.inp('address2',  data.address2);
    if (data.pinCode   && await this.vis('pinCode'))   { await this.inp('pinCode', data.pinCode); await this.v('pinCode').press('Tab'); await this.waitForAjax(); }
    if (data.mobileNo1 && await this.vis('mobileNo1')) await this.inp('mobileNo1', data.mobileNo1);
    if (data.emailId   && await this.vis('emailId'))   await this.inp('emailId',   data.emailId);
    if (data.phone     && await this.vis('phone'))     await this.inp('phone',     data.phone);
    if (data.ownership && await this.vis('ownership')) await this.sel('ownership', data.ownership);
  }

  async fillAdditionalDetails(data: Partial<CustomerData>): Promise<void> {
    await this.clickNext('KYCAvailableY');
    if (data.KYCAvailableYn) { const rid = data.KYCAvailableYn === 'Y' ? 'KYCAvailableY' : 'KYCAvailableN'; if (await this.vis(rid)) await this.radio(rid); }
    if (data.occupation     && await this.vis('occupation'))     { await this.sel('occupation', data.occupation); await this.waitForAjax(); }
    if (data.occupationType && await this.vis('occupationType')) await this.sel('occupationType', data.occupationType);
    if (data.religion       && await this.vis('religion'))       await this.sel('religion',       data.religion);
    if (data.qualification  && await this.vis('qualification'))  await this.sel('qualification',  data.qualification);
    if (data.specialInstruct1 && await this.vis('specialInstruct1')) await this.inp('specialInstruct1', data.specialInstruct1);
    if (data.specialInstruct2 && await this.vis('specialInstruct2')) await this.inp('specialInstruct2', data.specialInstruct2);
  }

  async save(): Promise<string> {
    const btn = this.page.locator('#saveDepositeparamDetails').first();
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    await this.modal.confirmSave();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`[CBS] ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }
}
