import { Page, Locator, expect } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface UserMasterData extends Record<string, unknown> {
  loginId?:              string;
  employeeId?:           string;
  roleCode?:             string;
  userBaseBranchCode?:   string;
  userSalutation?:       string;
  userFName?:            string;
  userMName?:            string;
  userLName?:            string;
  userDisplayName?:      string;
  userTypeCode?:         string;
  preferLang?:           string;
  mobileNo1?:            string;
  emailId?:              string;
  hnwCategory?:          string;
  mulBranchAcccess?:     string;
  allowConcurrentLogin?: string;
  forcePwdChg?:          string;
  docUpload?:            string;
}

export class UserMasterPage extends CbsPage {
  protected readonly screenId = 'USERMGMT';

  constructor(page: Page) { super(page); }

  private f = (id: string): Locator => this.page.locator(`#${id}`).first();

  private inp = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.fill(val, { force: true });
    await loc.press('Tab');
  };

  private sel = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.selectOption(val).catch(() => loc.selectOption({ label: val }).catch(() => {}));
    await loc.press('Tab').catch(() => {});
  };

  private radio = async (yId: string, nId: string, val: string): Promise<void> => {
    if (!val) return;
    const id = (val === '1' || val.toUpperCase() === 'Y') ? yId : nId;
    await this.page.locator(`#${id}`).first().click({ force: true }).catch(() => {});
  };

  async openCreateForm(): Promise<void> {
    await this.page.locator('#addButton').waitFor({ state: 'visible', timeout: 20_000 });
    await this.page.locator('#addButton').click({ force: true });
    await this.f('loginId').waitFor({ state: 'visible', timeout: 20_000 });
  }

  async searchRecord(searchText: string): Promise<void> {
    const box = this.page.locator('#searchBox, input[type="search"]').first();
    await box.fill(searchText, { force: true }).catch(() => {});
    await this.page.waitForTimeout(800);
  }

  async fillForm(data: UserMasterData): Promise<void> {
    if (data.loginId !== undefined) {
      await this.inp('loginId', data.loginId);
      await this.page.waitForTimeout(400);
      const toastVis = await this.page.locator('.toast-messages .msg-toast em').first().isVisible({ timeout: 300 }).catch(() => false);
      if (toastVis) {
        const msg = await this.page.locator('.toast-messages .msg-toast em').first().innerText().catch(() => '');
        if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) throw new Error(`DUPLICATE:${data.loginId}`);
      }
    }
    if (data.employeeId !== undefined) await this.inp('employeeId', data.employeeId);
    if (data.roleCode !== undefined) {
      await this.page.locator('#roleCodeF2').first().click({ force: true });
      const rp = this.page.locator('#add-popnew');
      await rp.waitFor({ state: 'visible', timeout: 10_000 });
      await this.page.waitForTimeout(1_000);
      await this.page.evaluate(() => { const tr = document.querySelector('#add-popnew table tbody tr') as HTMLElement; if (tr) tr.click(); });
      await rp.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => this.page.keyboard.press('Escape'));
      await this.page.waitForTimeout(200);
    }
    if (data.userBaseBranchCode !== undefined) {
      const branchDone = this.page.waitForResponse(r => r.url().includes('getUserByStatus'), { timeout: 15_000 }).catch(() => null);
      await this.page.locator('#assignedBranchF2').first().click({ force: true });
      const bp = this.page.locator('#add-popnew');
      await bp.waitFor({ state: 'visible', timeout: 10_000 });
      await this.page.waitForTimeout(300);
      const bi = bp.locator('input:visible').first();
      if (await bi.count() > 0) {
        await bi.fill(String(data.userBaseBranchCode));
        const sb = bp.locator('button:visible').filter({ hasText: /search/i }).first();
        if (await sb.count() > 0) { await sb.click(); await this.page.waitForTimeout(800); }
      }
      await this.page.evaluate(() => { const td = document.querySelector('#add-popnew table tbody tr td.selecttd1') as HTMLElement; if (td) td.click(); else { const tr = document.querySelector('#add-popnew table tbody tr') as HTMLElement; if (tr) tr.click(); } });
      await bp.waitFor({ state: 'hidden', timeout: 8_000 }).catch(() => this.page.keyboard.press('Escape'));
      await branchDone;
      await this.page.waitForTimeout(500);
      const loginIdVal = await this.f('loginId').inputValue().catch(() => '');
      if (!loginIdVal) throw new Error(`DUPLICATE:${data.loginId}`);
    }
    try {
      if (data.userSalutation  !== undefined) await this.sel('userSalutation',  data.userSalutation);
      if (data.userFName       !== undefined) await this.inp('userFName',       data.userFName);
      if (data.userMName       !== undefined) await this.inp('userMName',       data.userMName);
      if (data.userLName       !== undefined) await this.inp('userLName',       data.userLName);
      if (data.userDisplayName !== undefined) await this.inp('userDisplayName', data.userDisplayName);
      if (data.userTypeCode    !== undefined) await this.sel('userTypeCode',    data.userTypeCode);
      if (data.preferLang      !== undefined) await this.sel('preferLang',      data.preferLang);
      if (data.mobileNo1       !== undefined) await this.inp('mobileNo1',       data.mobileNo1);
      if (data.emailId         !== undefined) await this.inp('emailId',         data.emailId);
      if (data.hnwCategory     !== undefined) await this.sel('hnwCategory',     data.hnwCategory);
      if (data.mulBranchAcccess     !== undefined) await this.radio('mulBranchAcccessY',     'mulBranchAcccessN',     data.mulBranchAcccess);
      if (data.allowConcurrentLogin !== undefined) await this.radio('allowConcurrentLoginY', 'allowConcurrentLoginN', data.allowConcurrentLogin);
      if (data.forcePwdChg          !== undefined) await this.radio('forcePwdChgY',          'forcePwdChgN',          data.forcePwdChg);
      if (data.docUpload !== undefined) { await this.page.locator('#docUpload').first().setInputFiles(data.docUpload); await this.page.waitForTimeout(300); }
    } catch (e: any) {
      if (e.message?.includes('closed')) throw new Error(`DUPLICATE:${data.loginId}`);
      throw e;
    }
  }

  async save(): Promise<string> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);
    const saveBtn = this.page.locator('#btnSave').first();
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await this.page.waitForTimeout(500);
    const modalHasClass = await this.page.locator('#tm-saveconfirm').getAttribute('class').then(c => (c ?? '').includes('tinymodal-showing')).catch(() => false);
    if (!modalHasClass) throw new Error('Save confirm modal did not appear — mandatory fields may be unfilled');
    await this.page.locator('#submitForm').click({ force: true });
    const anyToast     = this.page.locator('.toast-messages .msg-toast em').first();
    const successToast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await anyToast.waitFor({ state: 'visible', timeout: 30_000 });
    const isSuccess = await successToast.isVisible().catch(() => false);
    const msg       = (await anyToast.innerText()).trim();
    if (!isSuccess) {
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists')) return msg;
      const errorFields: string[] = [];
      for (const div of await this.page.locator('.control-error').all()) {
        if (!await div.isVisible().catch(() => false)) continue;
        const id  = await div.getAttribute('id').catch(() => '');
        const txt = (await div.innerText().catch(() => '')).trim().split('\n')[0].trim();
        if (txt) errorFields.push(`${id}: ${txt}`);
      }
      throw new Error(`Save failed. Toast: "${msg}". Errors: [${errorFields.join(' | ')}]`);
    }
    return msg;
  }

  async approve(searchText: string): Promise<string> {
    const row = this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.hover();
    await this.page.waitForTimeout(300);
    await row.locator('.authorization-btns a').first().click({ force: true });
    await this.page.waitForTimeout(500);
    const approveBtn = this.page.locator('#idApprove, button:has-text("Approve")').first();
    await approveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await approveBtn.click();
    await this.page.waitForTimeout(300);
    await this.page.locator('#btnApproveId').click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async switchToPendingTab(): Promise<void> {
    await this.page.waitForTimeout(1_500);
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }

  async switchToAuthorizedTab(): Promise<void> { await this.page.locator('#AuthorizedList').click(); await this.page.waitForTimeout(300); }

  async isRecordInPendingGrid(loginId: string): Promise<boolean> {
    await this.page.waitForTimeout(800);
    return this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: loginId }).first().isVisible({ timeout: 8_000 }).catch(() => false);
  }

  async isRecordInAuthorizedGrid(loginId: string): Promise<boolean> {
    return this.page.locator('#dt-authdata tbody tr').filter({ hasText: loginId }).first().isVisible({ timeout: 5_000 }).catch(() => false);
  }

  async verifyFieldReadOnly(fieldId: string): Promise<void> {
    const loc = this.f(fieldId);
    const isDisabled = await loc.isDisabled().catch(() => false);
    const isReadonly = await loc.getAttribute('readonly').then(v => v !== null).catch(() => false);
    expect(isDisabled || isReadonly, `Field #${fieldId} must be read-only`).toBe(true);
  }

  async getFieldValue(fieldId: string): Promise<string> { return this.f(fieldId).inputValue().catch(() => ''); }
}
