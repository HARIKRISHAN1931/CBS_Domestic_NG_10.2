import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface BranchToBranchMappingData extends Record<string, unknown> {
  fromBranch?:  string;
  toBranch?:    string;
  mappingType?: string;
}

export class BranchToBranchDataMappingPage extends CbsPage {
  protected readonly screenId = 'BRTOBR MAP';
  constructor(page: Page) { super(page); }
  private v   = (id: string): Locator => this.loc(`#${id}`);
  private inp = async (id: string, val: string) => { await this.fill(this.v(id), val); };
  private tab = async (id: string) => { await this.v(id).press('Tab'); };

  async openCreateForm(): Promise<void> {
    await this.loc('button.add, #addButton, a.button.add').first().click();
    await this.waitForAjax();
    await this.v('fromBranch').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: BranchToBranchMappingData): Promise<void> {
    await this.waitForAjax();
    if (data.fromBranch)  { await this.inp('fromBranch',  data.fromBranch);  await this.tab('fromBranch'); }
    if (data.toBranch)    { await this.inp('toBranch',    data.toBranch);    await this.tab('toBranch'); }
    if (data.mappingType) { await this.inp('mappingType', data.mappingType); await this.tab('mappingType'); }
  }

  async save(): Promise<string> {
    for (let attempt = 1; attempt <= 10; attempt++) {
      const btn = this.loc('button#saveCustomer, a.button.sm.btn-save, #btnSave').first();
      const visible = await btn.waitFor({ state: 'visible', timeout: 10_000 }).then(() => true).catch(() => false);
      if (!visible) continue;
      await btn.scrollIntoViewIfNeeded().catch(() => {});
      await btn.click({ force: true });
      await this.waitForAjax();
      const confirmVisible = await this.loc('#submitForm').waitFor({ state: 'visible', timeout: 8_000 }).then(() => true).catch(() => false);
      if (!confirmVisible) continue;
      await this.loc('#submitForm').click();
      await this.waitForAjax();
      const errToast = this.loc('.toast-messages .msg-toast.msg-error em');
      if (await errToast.isVisible({ timeout: 3_000 }).catch(() => false)) continue;
      const toast = this.loc('.toast-messages .msg-toast.msg-success em');
      if (await toast.isVisible({ timeout: 15_000 }).catch(() => false)) return (await toast.innerText()).trim();
    }
    throw new Error('[BranchToBranchDataMapping] Save failed after 10 attempts');
  }

  async create(data: BranchToBranchMappingData): Promise<string> { await this.fillForm(data); return this.save(); }

  async approve(searchText: string): Promise<string> {
    await this.loc('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first().locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.loc('#idApprove').click();
    await this.loc('#btnApproveId').click();
    await this.waitForAjax();
    const toast = this.loc('.toast-messages .msg-toast.msg-success em');
    await toast.first().waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.first().innerText()).trim();
  }

  async reject(searchText: string, remark: string): Promise<string> {
    await this.loc('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first().locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.loc('#idReject').click();
    await this.loc('#rejectRemark, #remarkId').first().fill(remark);
    await this.loc('#btnRejectId').click();
    await this.waitForAjax();
    const toast = this.loc('.toast-messages .msg-toast.msg-success em');
    await toast.first().waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.first().innerText()).trim();
  }

  async update(searchText: string, data: Partial<BranchToBranchMappingData>): Promise<string> {
    await this.loc('#searchInput, input[type="search"]').first().fill(searchText);
    await this.waitForAjax();
    await this.loc('a.btn-edit, .edit-btn, a[title="Edit"]').first().click();
    await this.waitForAjax();
    await this.fillForm(data as BranchToBranchMappingData);
    return this.save();
  }
}
