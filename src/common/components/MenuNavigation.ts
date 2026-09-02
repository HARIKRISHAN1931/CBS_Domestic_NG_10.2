import { Page } from '@playwright/test';

const escId = (id: string) => id.replace(/([\W])/g, '\\$1');

export class MenuNavigation {
  constructor(private readonly page: Page) {}

  async navigate(topSection: string, subSection: string, menuItemId: string): Promise<void> {
    await this.ensureSidebarExpanded();

    const sectionToggle = this.page.locator(`li#${escId(topSection)} > a.dropnav`);
    await sectionToggle.waitFor({ state: 'attached', timeout: 10_000 });

    // open top section if not already open
    const topClass = await sectionToggle.getAttribute('class').catch(() => '');
    if (!(topClass ?? '').includes('mn-open')) {
      await sectionToggle.click({ force: true });
      await this.page.waitForTimeout(500);
    }

    // open sub section
    const subToggle = this.page.locator(`li#${escId(subSection)} > a.s-dropnav`);
    await subToggle.waitFor({ state: 'attached', timeout: 8_000 });
    const subClass = await subToggle.getAttribute('class').catch(() => '');
    if (!(subClass ?? '').includes('smn-open')) {
      await subToggle.click({ force: true });
      await this.page.waitForTimeout(800);
    }

    // click menu item
    const menuItem = this.page.locator(`li#${escId(menuItemId)} > a`);
    await menuItem.waitFor({ state: 'visible', timeout: 10_000 });
    await menuItem.click();
    await this.page.waitForTimeout(1_500);
  }

  private async ensureSidebarExpanded(): Promise<void> {
    const hamburger = this.page.locator('a.item-nav').first();
    await hamburger.waitFor({ state: 'visible', timeout: 15_000 });

    // Sidebar is expanded when li#Masters > a is visible (width > 100px)
    const sectionLink = this.page.locator('li#Masters > a.dropnav');
    await sectionLink.waitFor({ state: 'attached', timeout: 10_000 });

    const box = await sectionLink.boundingBox().catch(() => null);
    if (box && box.width > 100) return; // already expanded

    await hamburger.click();
    await this.page.waitForTimeout(800);
  }
}
