import { Page } from '@playwright/test';

export class HeaderComponent {
  constructor(private readonly page: Page) {}

  async getOperationalDate(): Promise<string> {
    const allLinks = await this.page.locator('a').allInnerTexts().catch(() => [] as string[]);
    for (const text of allLinks) {
      const match = text.match(/(\d{2}-\d{2}-\d{4})/);
      if (match && text.toLowerCase().includes('operational')) return match[1];
    }
    return '';
  }

  async getBranchCode(): Promise<string> {
    return this.page.locator('b i').first()
      .innerText().then(t => t.replace(/[()]/g, '').trim()).catch(() => '');
  }

  async getLoggedInUser(): Promise<string> {
    return this.page.locator('.user-name, .logged-user').first()
      .innerText().catch(() => '');
  }
}
