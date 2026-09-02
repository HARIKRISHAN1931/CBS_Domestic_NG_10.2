import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface ClearingData extends Record<string, unknown> {
  clearingType?:  string;
  batchNo?:       string;
  clearingDate?:  string;
  branchCode?:    string;
  remarks?:       string;
}

export class ClearingPage extends CbsPage {
  protected readonly screenId = 'OUTWARDFILEUPLOAD';
  constructor(page: Page) { super(page); }
  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).fill(v); await this.f(id).press('Tab'); };
  private sel = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).selectOption(v).catch(() => {}); };

  async fillForm(data: ClearingData): Promise<void> {
    if (data.clearingType) await this.sel('clearingType', data.clearingType);
    if (data.batchNo)      await this.inp('batchNo',      data.batchNo);
    if (data.clearingDate) await this.inp('clearingDate', data.clearingDate);
    if (data.branchCode)   await this.sel('branchCode',   data.branchCode);
    if (data.remarks)      await this.inp('remarks',      data.remarks);
  }
}
