import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface PigmyAgentData extends Record<string, unknown> {
  agentCode?:     string;
  agentName?:     string;
  branchCode?:    string;
  commissionPct?: string;
  startDate?:     string;
  remarks?:       string;
}

export class PigmyAgentPage extends CbsPage {
  protected readonly screenId = 'AGENTREGMSTR';
  constructor(page: Page) { super(page); }
  private f   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).fill(v); await this.f(id).press('Tab'); };
  private sel = async (id: string, v: string) => { if (!v) return; await this.f(id).waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {}); await this.f(id).selectOption(v).catch(() => {}); };

  async fillForm(data: PigmyAgentData): Promise<void> {
    if (data.agentCode)     await this.inp('agentCode',     data.agentCode);
    if (data.agentName)     await this.inp('agentName',     data.agentName);
    if (data.branchCode)    await this.sel('branchCode',    data.branchCode);
    if (data.commissionPct) await this.inp('commissionPct', data.commissionPct);
    if (data.startDate)     await this.inp('startDate',     data.startDate);
    if (data.remarks)       await this.inp('remarks',       data.remarks);
  }
  async create(data: PigmyAgentData): Promise<string> { await this.fillForm(data); return this.save(); }
  async switchToPendingTab(): Promise<void> {
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }
}
