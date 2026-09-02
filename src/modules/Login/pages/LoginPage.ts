import { expect, Locator, Page } from '@playwright/test';
import { config } from '../../../framework/config/config';

export class LoginPage {
  readonly page:          Page;
  readonly userIdInput:   Locator;
  readonly passwordInput: Locator;
  readonly loginButton:   Locator;

  // CBS shows errors as toast messages
  private readonly errorToast: Locator;

  constructor(page: Page) {
    this.page          = page;
    this.userIdInput   = page.locator('#loginId');
    this.passwordInput = page.locator('#uiPwd');
    this.loginButton   = page.locator('#userLogin');
    this.errorToast    = page.locator('.msg-toast.msg-error em, .toast-messages .msg-error, [role="alert"]').first();
  }

  async goto() {
    await this.page.goto(`${config.baseUrl}${config.appPath}`, { waitUntil: 'domcontentloaded' });
    await expect(this.userIdInput).toBeVisible({ timeout: 15_000 });
  }

  async login(userId: string, password: string) {
    await this.userIdInput.fill(userId);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async expectInvalidCredentialsError() {
    await expect(this.errorToast).toBeVisible({ timeout: 10_000 });
  }
}
