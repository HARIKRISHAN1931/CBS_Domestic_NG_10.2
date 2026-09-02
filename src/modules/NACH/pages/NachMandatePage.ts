import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface NachMandateData extends Record<string, unknown> {
  utilityCode?:    string;
  accountNo?:      string;
  amount?:         string;
  frequency?:      string;
  startDate?:      string;
  endDate?:        string;
  mandateType?:    string;
  sponsorCode?:    string;
  umrn?:           string;
  remarks?:        string;
  searchKey?:      string;
}

export class NachMandatePage extends CbsPage {
  protected readonly screenId = 'DBTLFILEUPLOAD';

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

  async fillForm(data: NachMandateData): Promise<void> {
    if (data.utilityCode) await this.sel('utilityCode', data.utilityCode);
    if (data.accountNo)   { await this.inp('accountNo', data.accountNo); await this.page.waitForTimeout(500); }
    if (data.amount)      await this.inp('amount',      data.amount);
    if (data.frequency)   await this.sel('frequency',   data.frequency);
    if (data.startDate)   await this.inp('startDate',   data.startDate);
    if (data.endDate)     await this.inp('endDate',     data.endDate);
    if (data.mandateType) await this.sel('mandateType', data.mandateType);
    if (data.sponsorCode) await this.inp('sponsorCode', data.sponsorCode);
    if (data.umrn)        await this.inp('umrn',        data.umrn);
    if (data.remarks)     await this.inp('remarks',     data.remarks);
  }

  async create(data: NachMandateData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
