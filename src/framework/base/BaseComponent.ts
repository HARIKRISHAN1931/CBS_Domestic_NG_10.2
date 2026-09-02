import { Page, Locator } from '@playwright/test';

export abstract class BaseComponent {
  protected readonly page: Page;
  protected readonly root: Locator;

  constructor(page: Page, root: Locator) {
    this.page = page;
    this.root = root;
  }

  async isVisible(): Promise<boolean>  { return this.root.isVisible(); }
  async waitForVisible(): Promise<void> { await this.root.waitFor({ state: 'visible' }); }
  async waitForHidden(): Promise<void>  { await this.root.waitFor({ state: 'hidden' }); }

  protected async click(locator: Locator): Promise<void>                { await locator.click(); }
  protected async fill(locator: Locator, value: string): Promise<void>  { await locator.clear(); await locator.fill(value); }
}
