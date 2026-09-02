import { Page, Locator, expect } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface AccountOpeningFormData extends Record<string, unknown> {
  customerNumber?:          string;
  moduleCode?:              string;
  productCode?:             string;
  schemeCode?:              string;
  modeOfOperation?:         string;
  documentFileNumber?:      string;
  additionalInformation1?:  string;
  additionalInformation2?:  string;
  nomineeYN?:               'Y' | 'N';
  stmtFreq?:                string;
  stmtMode?:                string;
  addressType?:             string;
  address1?:                string;
  address2?:                string;
  address3?:                string;
  countryCode?:             string;
  stateCode?:               string;
  districtCode?:            string;
}

export class AccountOpeningPage extends CbsPage {
  protected readonly screenId = 'PRDACNOMST';

  constructor(page: Page) { super(page); }

  private f = (id: string): Locator => this.page.locator(`#${id}`).first();

  private inp = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.click({ force: true });
    await loc.fill(val);
    await loc.press('Tab');
    await this.page.waitForTimeout(80);
  };

  private sel = async (id: string, val: string, pollMs = 8_000): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    const deadline = Date.now() + pollMs;
    while (Date.now() < deadline) {
      if (!await loc.isDisabled().catch(() => true)) break;
      await this.page.waitForTimeout(300);
    }
    await loc.selectOption(val).catch(() => loc.selectOption({ label: val }).catch(() => {}));
    await loc.press('Tab');
    await this.page.waitForTimeout(150);
  };

  private sel2 = async (id: string, searchText?: string): Promise<void> => {
    const container = this.page.locator(`#select2-${id}-container`).first();
    await container.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await container.click({ force: true });
    await this.page.waitForTimeout(400);
    const searchBox = this.page.locator('.select2-search__field').last();
    if (searchText && await searchBox.isVisible({ timeout: 800 }).catch(() => false)) {
      const filterTerm = searchText.split(/[\s-]+/).filter(Boolean).pop() ?? searchText;
      await searchBox.fill(filterTerm.slice(0, 8));
      await this.page.waitForTimeout(300);
    }
    const opts = await this.page.locator('.select2-results__option').all();
    if (opts.length === 0) { await this.page.keyboard.press('Escape'); return; }
    if (searchText) {
      for (const opt of opts) {
        const txt = await opt.innerText().catch(() => '');
        if (txt.trim().toLowerCase().includes(searchText.toLowerCase())) { await opt.click({ force: true }); await this.page.waitForTimeout(300); return; }
      }
    }
    await opts[0].click({ force: true });
    await this.page.waitForTimeout(300);
  };

  private waitForOptions = async (id: string, timeoutMs = 10_000): Promise<void> => {
    const loc = this.f(id);
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await loc.locator('option').count().catch(() => 0) > 1) return;
      await this.page.waitForTimeout(300);
    }
  };

  private waitForStmtModeState = async (timeoutMs = 5_000): Promise<void> => {
    const loc = this.f('stmtMode');
    const deadline = Date.now() + timeoutMs;
    let prev: boolean | null = null;
    while (Date.now() < deadline) {
      const cur = await loc.isDisabled().catch(() => true);
      if (cur === prev) return;
      prev = cur;
      await this.page.waitForTimeout(300);
    }
  };

  async openCreateForm(): Promise<void> {
    const btn = this.page.locator('a.button.add, button.button.add, #btnAddAccount').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.click({ force: true });
    await this.f('customerNumber').waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: AccountOpeningFormData): Promise<void> {
    if (data.customerNumber !== undefined) { await this.inp('customerNumber', data.customerNumber); await this.page.waitForTimeout(1_500); }
    if (data.moduleCode  !== undefined) { await this.waitForOptions('moduleCode');  await this.sel('moduleCode',  data.moduleCode);  await this.waitForOptions('productCode'); }
    if (data.productCode !== undefined) { await this.waitForOptions('productCode'); await this.sel('productCode', data.productCode); await this.waitForOptions('schemeCode'); }
    if (data.schemeCode  !== undefined) { await this.waitForOptions('schemeCode');  await this.sel('schemeCode',  data.schemeCode);  await this.page.waitForTimeout(500); }
    if (data.modeOfOperation !== undefined) await this.sel('modeOfOperation', data.modeOfOperation);
    if (data.nomineeYN !== undefined) { await this.page.locator(`#nominee${data.nomineeYN}`).first().click({ force: true }).catch(() => {}); await this.page.waitForTimeout(200); }
    if (data.documentFileNumber    !== undefined) await this.inp('documentFileNumber',    data.documentFileNumber);
    if (data.additionalInformation1 !== undefined) await this.inp('additionalInformation1', data.additionalInformation1);
    if (data.additionalInformation2 !== undefined) await this.inp('additionalInformation2', data.additionalInformation2);
    if (data.stmtFreq !== undefined) { await this.sel('stmtFreq', data.stmtFreq as string); await this.waitForStmtModeState(); }
    if (data.stmtMode !== undefined) { const isDisabled = await this.f('stmtMode').isDisabled().catch(() => true); if (!isDisabled) await this.sel('stmtMode', data.stmtMode as string); }
    if (data.addressType  !== undefined) await this.sel('addressType',  data.addressType);
    if (data.address1     !== undefined) await this.inp('address1',     data.address1);
    if (data.address2     !== undefined) await this.inp('address2',     data.address2);
    if (data.address3     !== undefined) await this.inp('address3',     data.address3);
    if (data.countryCode  !== undefined) await this.sel('countryCode',  data.countryCode);
    if (data.stateCode    !== undefined) await this.sel2('stateCode',   data.stateCode);
    if (data.districtCode !== undefined) await this.sel2('districtCode', data.districtCode);
  }

  async save(): Promise<string> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(300);
    const saveBtn = this.page.locator('#createAccount').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click();
    await this.page.waitForTimeout(600);
    const submitBtn = this.page.locator('#submitForm').first();
    if (!await submitBtn.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error('Save confirm modal did not appear');
    await submitBtn.click();
    const successToast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    const anyToast     = this.page.locator('.toast-messages .msg-toast em').first();
    await anyToast.waitFor({ state: 'visible', timeout: 20_000 });
    const isSuccess = await successToast.isVisible().catch(() => false);
    const msg       = (await anyToast.innerText()).trim();
    if (!isSuccess) throw new Error(`Save failed: "${msg}"`);
    await this.page.waitForURL(/accountList|createNewAccnt/, { timeout: 15_000 }).catch(() => {});
    return msg;
  }

  async create(data: AccountOpeningFormData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async approve(searchText: string): Promise<string> {
    const row = this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.hover();
    await this.page.waitForTimeout(500);
    await row.locator('a[href*="callAuthRejectfn"], a.show-btns').first().click({ force: true });
    await this.page.locator('#approveBtn').waitFor({ state: 'visible', timeout: 10_000 });
    await this.page.locator('#approveBtn').click();
    await this.page.waitForTimeout(500);
    await this.page.locator('#btnApproveId').click({ force: true });
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async switchToPendingTab(): Promise<void> {
    await this.page.waitForTimeout(2_000);
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 10_000 }).catch(() => false)) await tab.click();
    else await this.page.locator('a, li').filter({ hasText: /pending/i }).first().click().catch(() => {});
    await this.page.waitForTimeout(1_000);
  }

  async switchToAuthorizedTab(): Promise<void> { await this.page.locator('#AuthorizedList').click(); await this.page.waitForTimeout(300); }

  async isRecordInPendingGrid(searchText: string): Promise<boolean> {
    await this.page.waitForTimeout(1_000);
    return this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first().isVisible({ timeout: 8_000 }).catch(() => false);
  }

  async verifyFieldReadOnly(fieldId: string): Promise<void> {
    const loc = this.f(fieldId);
    const isDisabled = await loc.isDisabled().catch(() => false);
    const isReadonly = await loc.getAttribute('readonly').then(v => v !== null).catch(() => false);
    expect(isDisabled || isReadonly, `Field #${fieldId} must be read-only`).toBe(true);
  }
}
