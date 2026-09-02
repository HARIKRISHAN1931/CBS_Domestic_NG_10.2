import { Page, Locator, expect } from '@playwright/test';
import { CBS_SELECTORS, CbsTab } from '../../framework/config/selectors';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';

export class GridComponent {
  constructor(private readonly page: Page) {}

  async switchTab(tab: CbsTab): Promise<void> {
    const tabMap: Record<CbsTab, string> = {
      pending:    CBS_SELECTORS.TAB_PENDING,
      authorized: CBS_SELECTORS.TAB_AUTHORIZED,
      rejected:   CBS_SELECTORS.TAB_REJECTED,
    };
    const tabEl = this.page.locator(tabMap[tab]);
    await tabEl.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await tabEl.click();
    await this.page.waitForTimeout(1000);
  }

  async clickRowAction(tableSelector: string, actionSelector: string, searchText = ''): Promise<void> {
    await this.page.waitForSelector(
      `${tableSelector} tbody tr:not(.dataTables_empty)`,
      { timeout: CBS_TIMEOUTS.ELEMENT }
    );
    const rows = this.page.locator(`${tableSelector} tbody tr`);
    const row  = searchText ? rows.filter({ hasText: searchText }).first() : rows.first();
    await row.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await row.hover();
    const actionBtn = row.locator(actionSelector).first();
    await actionBtn.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await actionBtn.click({ force: true });
  }

  async clickAuthorize(searchText = ''): Promise<void> {
    await this.clickRowAction(CBS_SELECTORS.PENDING_TABLE, CBS_SELECTORS.AUTH_BTN_IN_ROW, searchText);
  }

  async searchAndEdit(searchText: string, tab: CbsTab = 'authorized'): Promise<void> {
    await this.switchTab(tab);
    const tableMap: Record<CbsTab, string> = {
      pending:    CBS_SELECTORS.PENDING_TABLE,
      authorized: CBS_SELECTORS.AUTH_TABLE,
      rejected:   CBS_SELECTORS.REJECTED_TABLE,
    };
    const tableSelector = tableMap[tab];
    const tableId       = tableSelector.replace('#', '');
    const input         = this.page.locator(`#${tableId}_filter input[type="search"]`).first();
    await input.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await input.clear();
    await input.fill(searchText);
    await expect.poll(
      () => this.page.locator(`${tableSelector} tbody tr`).filter({ hasText: searchText }).count(),
      { message: `Grid row with "${searchText}" to appear`, timeout: CBS_TIMEOUTS.ELEMENT }
    ).toBeGreaterThan(0);
    await this.clickRowAction(tableSelector, CBS_SELECTORS.EDIT_BTN_IN_ROW, searchText);
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getRowCount(tableSelector: string): Promise<number> {
    return this.page.locator(`${tableSelector} tbody tr:not(.dataTables_empty)`).count();
  }
}
