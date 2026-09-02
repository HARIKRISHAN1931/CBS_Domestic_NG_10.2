import { Page, Locator, expect, test } from '@playwright/test';
import { CBS_TIMEOUTS } from '../config/timeouts';
import { ToastComponent } from '../../common/components/ToastComponent';
import { ModalComponent } from '../../common/components/ModalComponent';
import { GridComponent } from '../../common/components/GridComponent';

export abstract class BasePage {
  constructor(protected page: Page) {}

  protected get toast(): ToastComponent { return new ToastComponent(this.page); }
  protected get modal(): ModalComponent { return new ModalComponent(this.page); }
  protected get grid():  GridComponent  { return new GridComponent(this.page); }

  protected loc(selector: string): Locator { return this.page.locator(selector); }

  async fill(locator: Locator, value: string): Promise<void> {
    if (!value) return;
    await locator.fill(value).catch(() => {});
  }

  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout: CBS_TIMEOUTS.ELEMENT });
    await locator.click();
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    if (!value) return;
    const ok = await locator.waitFor({ state: 'visible', timeout: 3_000 }).then(() => true).catch(() => false);
    if (!ok) return;
    const v    = value.trim();
    const done = await locator.selectOption(v).then(() => true).catch(() => false);
    if (!done) await locator.selectOption({ label: v }).catch(() => {});
  }

  protected async step<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return test.step(name, fn);
  }

  async expectVisible(locator: Locator): Promise<void> { await expect(locator).toBeVisible(); }
  async expectText(locator: Locator, text: string): Promise<void> { await expect(locator).toContainText(text); }
  async waitForAjax(): Promise<void> {}

  protected async switchToActivePage(): Promise<void> {
    let ctx: import('@playwright/test').BrowserContext;
    try { ctx = this.page.context(); } catch { return; }
    const appPages = ctx.pages().filter(p =>
      !p.isClosed() &&
      p.url() !== 'about:blank' &&
      !p.url().includes('LoginPage')
    );
    if (!appPages.length) return;
    // Always switch to the most recently opened page
    const newest = appPages[appPages.length - 1];
    if (newest !== this.page) {
      this.page = newest;
      await this.page.bringToFront().catch(() => {});
    }
  }

  async switchToScreen(): Promise<void> { await this.switchToActivePage(); }

  async getSuccessToast(timeout = CBS_TIMEOUTS.TOAST): Promise<string> { return this.toast.getSuccess(timeout); }
  async getErrorToast(timeout = CBS_TIMEOUTS.ELEMENT): Promise<string>  { return this.toast.getError(timeout); }
  async assertNoErrorToast(timeout = CBS_TIMEOUTS.SHORT): Promise<void> { return this.toast.assertNoError(timeout); }

  async getSessionInfo(): Promise<{ operationalDate: string; branchCode: string }> {
    let operationalDate = '';
    const allLinks = await this.page.locator('a').allInnerTexts().catch(() => [] as string[]);
    for (const text of allLinks) {
      const match = text.match(/(\d{2}-\d{2}-\d{4})/);
      if (match && text.toLowerCase().includes('operational')) { operationalDate = match[1]; break; }
    }
    const branchCode = await this.page.locator('b i').first()
      .innerText().then(t => t.replace(/[()]/g, '').trim()).catch(() => '');
    return { operationalDate, branchCode };
  }
}
