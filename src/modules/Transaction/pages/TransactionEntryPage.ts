import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface TransactionData extends Record<string, unknown> {
  trnCode?:    string;
  accountNo?:  string;
  amount?:     string;
  narration?:  string;
  valueDate?:  string;
  remarks?:    string;
}

export class TransactionEntryPage extends CbsPage {
  protected readonly screenId = 'DORMTRFR';
  constructor(page: Page) { super(page); }
  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).fill(v); await this.f(id).press('Tab'); };
  private sel = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).selectOption(v).catch(() => {}); };

  async fillForm(data: TransactionData): Promise<void> {
    if (data.trnCode)   await this.sel('trnCode',   data.trnCode);
    if (data.accountNo) { await this.inp('accountNo', data.accountNo); await this.page.waitForTimeout(500); }
    if (data.amount)    await this.inp('amount',    data.amount);
    if (data.narration) await this.inp('narration', data.narration);
    if (data.valueDate) await this.inp('valueDate', data.valueDate);
    if (data.remarks)   await this.inp('remarks',   data.remarks);
  }
}
