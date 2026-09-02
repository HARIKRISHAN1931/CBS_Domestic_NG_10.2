import { Page, Locator, expect } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';
import { CBS_SELECTORS, CbsTab } from '../../../framework/config/selectors';
import { CBS_TIMEOUTS } from '../../../framework/config/timeouts';

export type ExportFormat = 'EXCEL' | 'PDF' | 'CSV';

export class CustomerListPage extends CbsPage {
  protected readonly screenId = 'CUSTOMER';

  constructor(page: Page) { super(page); }

  // ── Tab helpers ──────────────────────────────────────────────────────────

  async switchTab(tab: CbsTab): Promise<void> {
    await this.grid.switchTab(tab);
  }

  async getTabCount(tab: CbsTab): Promise<number> {
    const tabSel: Record<CbsTab, string> = {
      pending:    CBS_SELECTORS.TAB_PENDING,
      authorized: CBS_SELECTORS.TAB_AUTHORIZED,
      rejected:   CBS_SELECTORS.TAB_REJECTED,
    };
    const text = await this.loc(tabSel[tab]).innerText().catch(() => '');
    const match = text.match(/\((\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }

  // ── Search ───────────────────────────────────────────────────────────────

  async search(tab: CbsTab, keyword: string): Promise<number> {
    await this.switchTab(tab);
    const tableId = this.tableIdFor(tab);
    const input   = this.loc(`#${tableId}_filter input[type="search"]`).first();
    await input.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await input.clear();
    await input.fill(keyword);
    await this.page.waitForTimeout(600);
    return this.grid.getRowCount(this.tableSelectorFor(tab));
  }

  async clearSearch(tab: CbsTab): Promise<void> {
    const tableId = this.tableIdFor(tab);
    const input   = this.loc(`#${tableId}_filter input[type="search"]`).first();
    await input.clear();
    await this.page.waitForTimeout(400);
  }

  // ── Row actions ──────────────────────────────────────────────────────────

  async clickEdit(searchText: string): Promise<void> {
    await this.grid.searchAndEdit(searchText, 'authorized');
  }

  async clickDelete(searchText: string): Promise<void> {
    await this.grid.clickRowAction(CBS_SELECTORS.PENDING_TABLE, 'a[title="Delete"], a.btn-delete', searchText);
  }

  async clickQuickView(searchText: string, tab: CbsTab = 'authorized'): Promise<void> {
    await this.switchTab(tab);
    await this.grid.clickRowAction(this.tableSelectorFor(tab), 'a[title="Quick View"], a.btn-quickview', searchText);
  }

  async clickViewPhoto(searchText: string): Promise<void> {
    await this.grid.clickRowAction(CBS_SELECTORS.AUTH_TABLE, 'a[title="View Photo"], a.btn-photo', searchText);
  }

  async clickViewSignature(searchText: string): Promise<void> {
    await this.grid.clickRowAction(CBS_SELECTORS.AUTH_TABLE, 'a[title="View Signature"], a.btn-signature', searchText);
  }

  // ── Export ───────────────────────────────────────────────────────────────

  async export(format: ExportFormat): Promise<void> {
    const btnText: Record<ExportFormat, string> = { EXCEL: 'EXCEL', PDF: 'PDF', CSV: 'CSV' };
    await this.loc(`button:has-text("${btnText[format]}"), a:has-text("${btnText[format]}")`).first().click();
    await this.page.waitForTimeout(1_000);
  }

  // ── Pagination ───────────────────────────────────────────────────────────

  async goToNextPage(tab: CbsTab): Promise<void> {
    const tableId = this.tableIdFor(tab);
    await this.loc(`#${tableId}_next`).click();
    await this.page.waitForTimeout(600);
  }

  async goToPrevPage(tab: CbsTab): Promise<void> {
    const tableId = this.tableIdFor(tab);
    await this.loc(`#${tableId}_previous`).click();
    await this.page.waitForTimeout(600);
  }

  // ── Assertions ───────────────────────────────────────────────────────────

  async assertRowVisible(tab: CbsTab, searchText: string): Promise<void> {
    const row = this.loc(this.tableSelectorFor(tab) + ' tbody tr').filter({ hasText: searchText }).first();
    await expect(row).toBeVisible({ timeout: CBS_TIMEOUTS.ELEMENT });
  }

  async assertRowNotVisible(tab: CbsTab, searchText: string): Promise<void> {
    const row = this.loc(this.tableSelectorFor(tab) + ' tbody tr').filter({ hasText: searchText }).first();
    await expect(row).not.toBeVisible({ timeout: CBS_TIMEOUTS.SHORT });
  }

  async assertTabVisible(): Promise<void> {
    await expect(this.loc(CBS_SELECTORS.TAB_PENDING)).toBeVisible();
    await expect(this.loc(CBS_SELECTORS.TAB_AUTHORIZED)).toBeVisible();
    await expect(this.loc(CBS_SELECTORS.TAB_REJECTED)).toBeVisible();
  }

  async assertAddButtonVisible(): Promise<void> {
    await expect(this.loc(CBS_SELECTORS.ADD_BTN)).toBeVisible();
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private tableIdFor(tab: CbsTab): string {
    return { pending: 'dt-pendingdata', authorized: 'dt-authdata', rejected: 'dt-rejecteddata' }[tab];
  }

  private tableSelectorFor(tab: CbsTab): string {
    return `#${this.tableIdFor(tab)}`;
  }
}
