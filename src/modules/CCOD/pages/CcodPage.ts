import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface CcodData extends Record<string, unknown> {
  customerCode?:  string;
  accountNo?:     string;
  drawingPower?:  string;
  adhocLimit?:    string;
  expiryDate?:    string;
  remarks?:       string;
  searchKey?:     string;
}

export class CcodPage extends CbsPage {
  protected readonly screenId = 'CCODADHOCLIMIT';

  constructor(page: Page) { super(page); }

  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.fill(val);
    await loc.press('Tab');
  };
  private sel = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.selectOption(val).catch(() => loc.selectOption({ label: val }).catch(() => {}));
  };

  async fillForm(data: CcodData): Promise<void> {
    if (data.customerCode) { await this.inp('customerCode', data.customerCode); await this.page.waitForTimeout(800); }
    if (data.accountNo)    { await this.inp('accountNo',    data.accountNo);    await this.page.waitForTimeout(500); }
    if (data.drawingPower) await this.inp('drawingPower', data.drawingPower);
    if (data.adhocLimit)   await this.inp('adhocLimit',   data.adhocLimit);
    if (data.expiryDate)   await this.inp('expiryDate',   data.expiryDate);
    if (data.remarks)      await this.inp('remarks',      data.remarks);
  }

  async create(data: CcodData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
