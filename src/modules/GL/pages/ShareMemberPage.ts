import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface ShareMemberData extends Record<string, unknown> {
  customerCode?:   string;
  shareType?:      string;
  noOfShares?:     string;
  faceValue?:      string;
  applicationDate?:string;
  remarks?:        string;
  searchKey?:      string;
}

export class ShareMemberPage extends CbsPage {
  protected readonly screenId = 'SHAREMEMBERMAINTAIN';

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

  async fillForm(data: ShareMemberData): Promise<void> {
    if (data.customerCode)    { await this.inp('customerCode', data.customerCode); await this.page.waitForTimeout(800); }
    if (data.shareType)       await this.sel('shareType',       data.shareType);
    if (data.noOfShares)      await this.inp('noOfShares',      data.noOfShares);
    if (data.faceValue)       await this.inp('faceValue',       data.faceValue);
    if (data.applicationDate) await this.inp('applicationDate', data.applicationDate);
    if (data.remarks)         await this.inp('remarks',         data.remarks);
  }

  async create(data: ShareMemberData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
