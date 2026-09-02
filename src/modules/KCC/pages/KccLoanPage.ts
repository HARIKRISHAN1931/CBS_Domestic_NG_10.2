import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface KccLoanData extends Record<string, unknown> {
  memberCode?:   string;
  cropType?:     string;
  loanAmount?:   string;
  sanctionDate?: string;
  expiryDate?:   string;
  remarks?:      string;
}

export class KccLoanPage extends CbsPage {
  protected readonly screenId = 'KCCLOANSANCTION';
  constructor(page: Page) { super(page); }
  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).fill(v); await this.f(id).press('Tab'); };
  private sel = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).selectOption(v).catch(() => {}); };

  async fillForm(data: KccLoanData): Promise<void> {
    if (data.memberCode)   { await this.inp('memberCode',   data.memberCode);   await this.page.waitForTimeout(800); }
    if (data.cropType)     await this.sel('cropType',     data.cropType);
    if (data.loanAmount)   await this.inp('loanAmount',   data.loanAmount);
    if (data.sanctionDate) await this.inp('sanctionDate', data.sanctionDate);
    if (data.expiryDate)   await this.inp('expiryDate',   data.expiryDate);
    if (data.remarks)      await this.inp('remarks',      data.remarks);
  }
  async create(data: KccLoanData): Promise<string> { await this.fillForm(data); return this.save(); }
  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
