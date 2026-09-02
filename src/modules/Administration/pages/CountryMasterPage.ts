import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface CountryMasterData extends Record<string, unknown> {
  countryCode?:        string;
  countryName?:        string;
  countryAbbrevation?: string;
  numCountyCd?:        string;
  countryType?:        string;
  isdCode?:            string;
  zone?:               string;
  region?:             string;
  restrictedY?:        string;
  restrictedN?:        string;
  gracePrdY?:          string;
  gracePrdN?:          string;
  gracePrd?:           string;
  ecgcCoverY?:         string;
  ecgcCoverN?:         string;
  isAplhanumericY?:    string;
  isAplhanumericN?:    string;
  pinLength?:          string;
  searchKey?:          string;
  tab?:                string;
}

export class CountryMasterPage extends CbsPage {
  protected readonly screenId = 'COUNTRYMST';
  constructor(page: Page) { super(page); }
  private v   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, val: string) => { await this.fill(this.v(id), val); };
  private sel = async (id: string, val: string) => { await this.selectOption(this.v(id), val); };
  private tab = async (id: string) => { await this.v(id).press('Tab'); };

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton');
    await addBtn.waitFor({ state: 'attached', timeout: 15_000 });
    await addBtn.click({ force: true });
    await this.waitForAjax();
    await this.page.locator('#countryCode').first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: CountryMasterData): Promise<void> {
    await this.waitForAjax();
    if (data.countryCode        !== undefined) { await this.inp('countryCode',        data.countryCode!);        await this.tab('countryCode'); }
    if (data.countryName        !== undefined) { await this.inp('countryName',        data.countryName!);        await this.tab('countryName'); }
    if (data.countryAbbrevation !== undefined) { await this.inp('countryAbbrevation', data.countryAbbrevation!); await this.tab('countryAbbrevation'); }
    if (data.numCountyCd        !== undefined) { await this.inp('numCountyCd',        data.numCountyCd!);        await this.tab('numCountyCd'); }
    if (data.countryType        !== undefined) await this.sel('countryType', data.countryType!);
    if (data.isdCode            !== undefined) await this.sel('isdCode',     data.isdCode!);
    if (data.zone               !== undefined) await this.sel('zone',        data.zone!);
    if (data.region             !== undefined) await this.sel('region',      data.region!);
    if (data.restrictedY        !== undefined) await this.page.locator(`#${data.restrictedY}`).click().catch(() => {});
    if (data.restrictedN        !== undefined) await this.page.locator(`#${data.restrictedN}`).click().catch(() => {});
    if (data.gracePrdY          !== undefined) await this.page.locator(`#${data.gracePrdY}`).click().catch(() => {});
    if (data.gracePrdN          !== undefined) await this.page.locator(`#${data.gracePrdN}`).click().catch(() => {});
    if (data.gracePrd           !== undefined) { await this.inp('gracePrd', data.gracePrd!); await this.tab('gracePrd'); }
    if (data.ecgcCoverY         !== undefined) await this.page.locator(`#${data.ecgcCoverY}`).click().catch(() => {});
    if (data.ecgcCoverN         !== undefined) await this.page.locator(`#${data.ecgcCoverN}`).click().catch(() => {});
    if (data.isAplhanumericY    !== undefined) await this.page.locator(`#${data.isAplhanumericY}`).click().catch(() => {});
    if (data.isAplhanumericN    !== undefined) await this.page.locator(`#${data.isAplhanumericN}`).click().catch(() => {});
    if (data.pinLength          !== undefined) { await this.inp('pinLength', data.pinLength!); await this.tab('pinLength'); }
  }

  async save(): Promise<string> {
    const btn = this.page.locator('button#saveCustomer').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
    await this.modal.confirmSave();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`CBS save error: ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }

  async create(data: CountryMasterData): Promise<string> { await this.fillForm(data); return this.save(); }

  async approve(searchKey: string, tab = 'pending'): Promise<string> {
    await this.grid.switchTab(tab as any);
    await this.grid.clickAuthorize(searchKey);
    await this.modal.confirmApprove();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`CBS approve error: ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }

  async reject(searchText: string, remark: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first().locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.page.locator('#idReject').click();
    await this.page.locator('#rejectRemark, #remarkId').first().fill(remark);
    await this.page.locator('#btnRejectId').click();
    await this.waitForAjax();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async update(data: CountryMasterData): Promise<string> {
    await this.grid.searchAndEdit(data.searchKey!, (data.tab as any) || 'authorized');
    await this.waitForAjax();
    await this.fillForm(data);
    return this.save();
  }
}
