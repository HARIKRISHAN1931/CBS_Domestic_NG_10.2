import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface VillageMasterData extends Record<string, unknown> {
  country?:           string;
  state?:             string;
  city?:              string;
  area?:              string;
  municipalityBlock?: string;
  villageCode?:       string;
  villageDesc?:       string;
  pinCode?:           string;
  searchKey?:         string;
  tab?:               string;
}

export class VillageMasterPage extends CbsPage {
  protected readonly screenId = 'VILLAGEMASTER';
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
    await this.loc('#villageCode').first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: VillageMasterData): Promise<void> {
    await this.waitForAjax();
    if (data.country           !== undefined) await this.sel('country',           data.country!);
    if (data.state             !== undefined) await this.sel('state',             data.state!);
    if (data.city              !== undefined) await this.sel('city',              data.city!);
    if (data.area              !== undefined) await this.sel('area',              data.area!);
    if (data.municipalityBlock !== undefined) await this.sel('municipalityBlock', data.municipalityBlock!);
    if (data.villageCode       !== undefined) { await this.inp('villageCode', data.villageCode!); await this.tab('villageCode'); }
    if (data.villageDesc       !== undefined) { await this.inp('villageDesc', data.villageDesc!); await this.tab('villageDesc'); }
    if (data.pinCode           !== undefined) { await this.inp('pinCode',     data.pinCode!);     await this.tab('pinCode'); }
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

  async create(data: VillageMasterData): Promise<string> { await this.fillForm(data); return this.save(); }

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

  async update(data: VillageMasterData): Promise<string> {
    await this.grid.searchAndEdit(data.searchKey!, (data.tab as any) || 'authorized');
    await this.waitForAjax();
    await this.fillForm(data);
    return this.save();
  }
}
