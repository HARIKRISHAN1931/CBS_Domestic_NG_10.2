import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface GoldLoanData extends Record<string, unknown> {
  customerCode?:  string;
  productCode?:   string;
  schemeCode?:    string;
  loanAmount?:    string;
  goldWeight?:    string;
  purity?:        string;
  sanctionDate?:  string;
  expiryDate?:    string;
  remarks?:       string;
}

export class GoldLoanPage extends CbsPage {
  protected readonly screenId = 'GoldLoanApplnMst';
  constructor(page: Page) { super(page); }
  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).fill(v); await this.f(id).press('Tab'); };
  private sel = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).selectOption(v).catch(() => {}); };
  private waitForOptions = async (id: string) => { const loc = this.f(id); const dl = Date.now() + 10_000; while (Date.now() < dl) { if (await loc.locator('option').count().catch(() => 0) > 1) return; await this.page.waitForTimeout(300); } };

  async fillForm(data: GoldLoanData): Promise<void> {
    if (data.customerCode) { await this.inp('customerCode', data.customerCode); await this.page.waitForTimeout(1_000); }
    if (data.productCode)  { await this.waitForOptions('productCode'); await this.sel('productCode', data.productCode); }
    if (data.schemeCode)   { await this.waitForOptions('schemeCode');  await this.sel('schemeCode',  data.schemeCode); }
    if (data.loanAmount)   await this.inp('loanAmount',   data.loanAmount);
    if (data.goldWeight)   await this.inp('goldWeight',   data.goldWeight);
    if (data.purity)       await this.sel('purity',       data.purity);
    if (data.sanctionDate) await this.inp('sanctionDate', data.sanctionDate);
    if (data.expiryDate)   await this.inp('expiryDate',   data.expiryDate);
    if (data.remarks)      await this.inp('remarks',      data.remarks);
  }
  async create(data: GoldLoanData): Promise<string> { await this.fillForm(data); return this.save(); }
  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
