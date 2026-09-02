import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface LoanLimitData extends Record<string, unknown> {
  customerCode?:    string;
  productCode?:     string;
  schemeCode?:      string;
  loanAmount?:      string;
  tenureMonths?:    string;
  tenureDays?:      string;
  modeOfRepayment?: string;
  repayFrequency?:  string;
  disbursementMode?:string;
  purposeCode?:     string;
  securityType?:    string;
  collateralValue?: string;
  marginPct?:       string;
  interestType?:    string;
  rateOfInterest?:  string;
  moratoriumMonths?:string;
  emiStartDate?:    string;
  sanctionDate?:    string;
  expiryDate?:      string;
  remarks?:         string;
  searchKey?:       string;
}

export class LoanLimitPage extends CbsPage {
  protected readonly screenId = 'LOANLIMIT';

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
  private waitForOptions = async (id: string, ms = 10_000): Promise<void> => {
    const loc = this.f(id);
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      if (await loc.locator('option').count().catch(() => 0) > 1) return;
      await this.page.waitForTimeout(300);
    }
  };

  async fillForm(data: LoanLimitData): Promise<void> {
    if (data.customerCode) { await this.inp('customerCode', data.customerCode); await this.page.waitForTimeout(1_000); }
    if (data.productCode)  { await this.waitForOptions('productCode');  await this.sel('productCode',  data.productCode); }
    if (data.schemeCode)   { await this.waitForOptions('schemeCode');   await this.sel('schemeCode',   data.schemeCode); }
    if (data.loanAmount)   { await this.inp('loanAmount_txt', data.loanAmount); await this.page.waitForTimeout(500); }
    if (data.tenureMonths) await this.inp('tenureMonths', data.tenureMonths);
    if (data.tenureDays)   await this.inp('tenureDays',   data.tenureDays);
    if (data.modeOfRepayment)  await this.sel('modeOfRepayment',  data.modeOfRepayment);
    if (data.repayFrequency)   await this.sel('repayFrequency',   data.repayFrequency);
    if (data.disbursementMode) await this.sel('disbursementMode', data.disbursementMode);
    if (data.purposeCode)      await this.sel('purposeCode',      data.purposeCode);
    if (data.securityType)     await this.sel('securityType',     data.securityType);
    if (data.collateralValue)  await this.inp('collateralValue',  data.collateralValue);
    if (data.marginPct)        await this.inp('marginPct',        data.marginPct);
    if (data.interestType)     await this.sel('interestType',     data.interestType);
    if (data.rateOfInterest)   await this.inp('rateOfInterest',   data.rateOfInterest);
    if (data.moratoriumMonths) await this.inp('moratoriumMonths', data.moratoriumMonths);
    if (data.emiStartDate)     await this.inp('emiStartDate',     data.emiStartDate);
    if (data.sanctionDate)     await this.inp('sanctionDate',     data.sanctionDate);
    if (data.expiryDate)       await this.inp('expiryDate',       data.expiryDate);
    if (data.remarks)          await this.inp('remarks',          data.remarks);
  }

  async create(data: LoanLimitData): Promise<string> {
    await this.fillForm(data);
    return this.save();
  }

  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
