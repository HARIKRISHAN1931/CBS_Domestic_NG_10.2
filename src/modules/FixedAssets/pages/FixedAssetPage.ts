import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface FixedAssetData extends Record<string, unknown> {
  assetCode?:      string;
  assetName?:      string;
  assetCategory?:  string;
  purchaseDate?:   string;
  purchaseValue?:  string;
  location?:       string;
  branchCode?:     string;
  remarks?:        string;
}

export class FixedAssetPage extends CbsPage {
  protected readonly screenId = 'FIXEDASSETDETAILS';
  constructor(page: Page) { super(page); }
  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).fill(v); await this.f(id).press('Tab'); };
  private sel = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).selectOption(v).catch(() => {}); };

  async fillForm(data: FixedAssetData): Promise<void> {
    if (data.assetCode)     await this.inp('assetCode',     data.assetCode);
    if (data.assetName)     await this.inp('assetName',     data.assetName);
    if (data.assetCategory) await this.sel('assetCategory', data.assetCategory);
    if (data.purchaseDate)  await this.inp('purchaseDate',  data.purchaseDate);
    if (data.purchaseValue) await this.inp('purchaseValue', data.purchaseValue);
    if (data.location)      await this.inp('location',      data.location);
    if (data.branchCode)    await this.sel('branchCode',    data.branchCode);
    if (data.remarks)       await this.inp('remarks',       data.remarks);
  }
  async create(data: FixedAssetData): Promise<string> { await this.fillForm(data); return this.save(); }
  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
