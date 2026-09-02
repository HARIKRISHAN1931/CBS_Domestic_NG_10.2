import { Browser, BrowserContext, Page } from '@playwright/test';
import { config } from '../config/config';
import { CBS_SELECTORS } from '../config/selectors';
import { CBS_TIMEOUTS } from '../config/timeouts';
import { logger } from '../logger/logger';

export interface SessionOptions {
  username: string;
  password: string;
  bankCode?: string;
}

export interface CbsSession {
  context: BrowserContext;
  page:    Page;
}

export class AuthManager {
  static async createSession(browser: Browser, opts: SessionOptions): Promise<CbsSession> {
    const bank    = opts.bankCode ? config.banks[opts.bankCode] : config.bank;
    const appPath = bank?.appPath ?? config.appPath;

    logger.info(`Creating session for user: ${opts.username} | bank: ${bank?.bankCode ?? 'default'}`);

    const context  = await browser.newContext({ baseURL: config.baseUrl });
    const loginTab = await context.newPage();

    await loginTab.goto(`${config.baseUrl}${appPath}`, { waitUntil: 'domcontentloaded' });

    const reloginBtn = loginTab.locator('#relogin');
    if (await reloginBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await reloginBtn.click();
      await loginTab.waitForLoadState('domcontentloaded');
    }

    await loginTab.locator('#loginId').fill(opts.username);
    await loginTab.locator('#loginId').press('Tab');
    await loginTab.locator('#uiPwd').fill(opts.password);

    // CBS may open app in a new tab OR navigate in the same tab
    let appPage: Page;
    const newPagePromise = context.waitForEvent('page', { timeout: 10_000 }).catch(() => null);
    await loginTab.locator('#userLogin').click();
    const newTab = await newPagePromise;
    if (newTab) {
      appPage = newTab;
    } else {
      // same-tab navigation — wait for hamburger on login tab
      appPage = loginTab;
    }

    await appPage.waitForLoadState('domcontentloaded');
    await appPage.bringToFront();
    // wait for any known post-login element — hamburger, menu section, or nav list
    await appPage.locator('a.item-nav, li#Masters, ul.lst-main-nav, .main-nav').first()
      .waitFor({ state: 'attached', timeout: CBS_TIMEOUTS.LOGIN });

    logger.pass(`Session created for: ${opts.username}`);
    return { context, page: appPage };
  }

  static async createMakerSession(browser: Browser, bankCode?: string): Promise<CbsSession> {
    return this.createSession(browser, {
      username: config.auth.username,
      password: config.auth.password,
      bankCode,
    });
  }

  static async createCheckerSession(browser: Browser, bankCode?: string): Promise<CbsSession> {
    return this.createSession(browser, {
      username: config.auth.checkerUsername,
      password: config.auth.checkerPassword,
      bankCode,
    });
  }
}
