import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface DistrictMasterData extends Record<string, unknown> {
  countryCode?:    string;
  stateCode?:      string;
  districtCode?:   string;
  districtName?:   string;
  numCityCode?:    string;
  censusDistCode?: string;
  subDistCode?:    string;
  searchKey?:      string;
  tab?:            string;
}

export class DistrictMasterPage extends CbsPage {
  protected readonly screenId = 'DISTRICTMST';

  constructor(page: Page) { super(page); }

  private v   = (id: string): Locator => this.loc(`#${id}`);
  private inp = async (id: string, val: string) => { await this.fill(this.v(id), val); };
  private sel = async (id: string, val: string) => { await this.selectOption(this.v(id), val); };
  private tab = async (id: string) => { await this.loc(`#${id}`).first().press('Tab').catch(() => {}); };

  async openCreateForm(): Promise<void> {
    const addBtn = this.loc('#addButton');
    await addBtn.waitFor({ state: 'attached', timeout: 30_000 });
    await addBtn.click({ force: true });
    await this.waitForAjax();
    await this.loc('#districtCode').first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: DistrictMasterData): Promise<void> {
    await this.waitForAjax();
    if (data.countryCode    !== undefined) await this.sel('countryCode',    data.countryCode!);
    if (data.stateCode      !== undefined) await this.sel('stateCode',      data.stateCode!);
    if (data.districtCode   !== undefined) { await this.inp('districtCode',   data.districtCode!);   await this.tab('districtCode'); }
    if (data.districtName   !== undefined) { await this.inp('districtName',   data.districtName!);   await this.tab('districtName'); }
    if (data.numCityCode    !== undefined) { await this.inp('numCityCode',    data.numCityCode!);    await this.tab('numCityCode'); }
    if (data.censusDistCode !== undefined) { await this.inp('censusDistCode', data.censusDistCode!); await this.tab('censusDistCode'); }
    if (data.subDistCode    !== undefined) { await this.inp('subDistCode',    data.subDistCode!);    await this.tab('subDistCode'); }
  }

  async save(): Promise<string> {
    const btn = this.loc('button#saveCustomer');
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
    await this.modal.confirmSave();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`CBS save error: ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }

  async create(data: DistrictMasterData): Promise<string> { await this.fillForm(data); return this.save(); }

  async approve(searchKey: string, tab = 'pending'): Promise<string> {
    await this.grid.switchTab(tab as any);
    await this.grid.clickAuthorize(searchKey);
    await this.modal.confirmApprove();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`CBS approve error: ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }

  async reject(searchKey: string, remark: string): Promise<string> {
    await this.grid.switchTab('pending');
    await this.grid.clickAuthorize(searchKey);
    await this.page.locator('#idReject').click();
    await this.page.locator('#rejectRemark, #remarkId').first().fill(remark);
    await this.page.locator('#btnRejectId').click();
    await this.waitForAjax();
    return this.toast.getSuccess();
  }

  async update(data: DistrictMasterData): Promise<string> {
    await this.grid.searchAndEdit(data.searchKey!, (data.tab as any) || 'authorized');
    await this.waitForAjax();
    await this.fillForm(data);
    return this.save();
  }
}
