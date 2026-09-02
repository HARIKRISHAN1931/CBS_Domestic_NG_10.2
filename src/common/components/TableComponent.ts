import { Page, Locator } from '@playwright/test';
import { CBS_TIMEOUTS } from '../../framework/config/timeouts';

export class TableComponent {
  constructor(private readonly page: Page) {}

  async getRowCount(tableSelector: string): Promise<number> {
    return this.page.locator(`${tableSelector} tbody tr:not(.dataTables_empty)`).count();
  }

  async getCellText(tableSelector: string, row: number, col: number): Promise<string> {
    return this.page.locator(`${tableSelector} tbody tr:nth-child(${row}) td:nth-child(${col})`)
      .innerText().catch(() => '');
  }

  async findRowByText(tableSelector: string, text: string): Promise<Locator> {
    return this.page.locator(`${tableSelector} tbody tr`).filter({ hasText: text }).first();
  }

  async waitForData(tableSelector: string): Promise<void> {
    await this.page.waitForSelector(
      `${tableSelector} tbody tr:not(.dataTables_empty)`,
      { timeout: CBS_TIMEOUTS.ELEMENT }
    );
  }
}
