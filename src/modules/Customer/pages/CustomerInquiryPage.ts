import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export class CustomerInquiryPage extends CbsPage {
  protected readonly screenId = 'CUSTOMER';

  constructor(page: Page) { super(page); }

  private v = (id: string): Locator => this.loc(`#${id}`);

  async searchByCustomerNumber(custNo: string): Promise<void> {
    const box = this.loc('#dt-authdata_filter input, #dt-pendingdata_filter input').first();
    await box.waitFor({ state: 'visible', timeout: 10_000 });
    await box.fill(custNo);
    await this.page.waitForTimeout(800);
  }

  async openRecord(custNo: string): Promise<void> {
    await this.searchByCustomerNumber(custNo);
    const row = this.loc('#dt-authdata tbody tr').filter({ hasText: custNo }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.locator('a').first().click();
    await this.v('memberFName').waitFor({ state: 'visible', timeout: 20_000 });
    await this.waitForAjax();
  }

  async getCustomerName(): Promise<string> {
    const first = await this.v('memberFName').inputValue().catch(() => '');
    const last  = await this.v('memberLName').inputValue().catch(() => '');
    return `${first} ${last}`.trim();
  }

  async getCustomerCategory(): Promise<string> { return this.v('customerCategory').inputValue().catch(() => ''); }
  async getMobileNumber(): Promise<string>      { return this.v('mobileNo1').inputValue().catch(() => ''); }
  async getEmailId(): Promise<string>           { return this.v('emailId').inputValue().catch(() => ''); }
}
