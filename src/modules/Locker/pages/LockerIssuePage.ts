import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface LockerIssueData extends Record<string, unknown> {
  customerCode?:   string;
  lockerNo?:       string;
  lockerType?:     string;
  branchCode?:     string;
  rentAmount?:     string;
  rentFrequency?:  string;
  issueDate?:      string;
  expiryDate?:     string;
  keyNo?:          string;
  depositAmount?:  string;
  remarks?:        string;
  searchKey?:      string;
}

export class LockerIssuePage extends CbsPage {
  protected readonly screenId = 'LOCKERISSUEREG';

  constructor(page: Page) { super(page); }

  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.fill(val);
    await loc.press('Tab');
    await this.page.waitForTimeout(100);
  };
  private sel = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    await loc.selectOption(val).catch(() => loc.selectOption({ label: val }).catch(() => {}));
  };

  async fillForm(data: LockerIssueData): Promise<void> {
    if (data.customerCode)  { await this.inp('customerCode', data.customerCode); await this.page.waitForTimeout(800); }
    if (data.lockerNo)      await this.inp('lockerNo',      data.lockerNo);
    if (data.lockerType)    await this.sel('lockerType',    data.lockerType);
    if (data.branchCode)    await this.sel('branchCode',    data.branchCode);
    if (data.rentAmount)    await this.inp('rentAmount',    data.rentAmount);
    if (data.rentFrequency) await this.sel('rentFrequency', data.rentFrequency);
    if (data.issueDate)     await this.inp('issueDate',     data.issueDate);
    if (data.expiryDate)    await this.inp('expiryDate',    data.expiryDate);
    if (data.keyNo)         await this.inp('keyNo',         data.keyNo);
    if (data.depositAmount) await this.inp('depositAmount', data.depositAmount);
    if (data.remarks)       await this.inp('remarks',       data.remarks);
  }

  async create(data: LockerIssueData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
