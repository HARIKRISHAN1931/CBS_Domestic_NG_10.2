import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface IfscMasterData extends Record<string, unknown> {
  ifscCd?:      string;
  bankName?:    string;
  bankRbiCd?:   string;
  branchRbiCd?: string;
  addr1?:       string;
  addr2?:       string;
  addr3?:       string;
  city?:        string;
  state?:       string;
}

export class IfscMasterPage extends CbsPage {
  protected readonly screenId = 'IFSCMST';
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
    await this.page.locator('#ifscCd').first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: IfscMasterData): Promise<void> {
    await this.waitForAjax();
    if (data.ifscCd      !== undefined) { await this.inp('ifscCd',      data.ifscCd!);      await this.tab('ifscCd'); }
    if (data.bankName    !== undefined) { await this.inp('bankName',    data.bankName!);    await this.tab('bankName'); }
    if (data.bankRbiCd   !== undefined) await this.sel('bankRbiCd',   data.bankRbiCd!);
    if (data.branchRbiCd !== undefined) await this.sel('branchRbiCd', data.branchRbiCd!);
    if (data.addr1       !== undefined) { await this.inp('addr1', data.addr1!); await this.tab('addr1'); }
    if (data.addr2       !== undefined) { await this.inp('addr2', data.addr2!); await this.tab('addr2'); }
    if (data.addr3       !== undefined) { await this.inp('addr3', data.addr3!); await this.tab('addr3'); }
    if (data.city        !== undefined) { await this.inp('city',  data.city!);  await this.tab('city'); }
    if (data.state       !== undefined) { await this.inp('state', data.state!); await this.tab('state'); }
  }

  async save(): Promise<string> {
    const btn = this.page.locator('#btnSave').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
    await this.waitForAjax();
    const confirm = this.page.locator('#submitForm');
    if (await confirm.isVisible({ timeout: 5_000 }).catch(() => false)) { await confirm.click(); await this.waitForAjax(); }
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 20_000 });
    return (await toast.innerText()).trim();
  }

  async create(data: IfscMasterData): Promise<string> { await this.fillForm(data); return this.save(); }

  async approve(searchText: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first().locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.page.locator('#idApprove').click();
    await this.page.locator('#btnApproveId').click();
    await this.waitForAjax();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
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

  async update(searchText: string, data: Partial<IfscMasterData>): Promise<string> {
    await this.page.locator('#searchInput, input[type="search"]').first().fill(searchText);
    await this.waitForAjax();
    await this.page.locator('a.btn-edit, .edit-btn, a[title="Edit"]').first().click();
    await this.waitForAjax();
    await this.fillForm(data as IfscMasterData);
    return this.save();
  }
}
