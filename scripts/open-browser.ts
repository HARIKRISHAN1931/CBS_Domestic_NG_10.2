import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false, args: ['--auto-open-devtools-for-tabs'] });
  const context = await browser.newContext();
  const page    = await context.newPage();

  await page.goto('http://172.21.0.39:7999/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en');

  const relogin = page.locator('#relogin');
  if (await relogin.isVisible({ timeout: 3_000 }).catch(() => false)) await relogin.click();

  await page.locator('#loginId').fill('demo1');
  await page.locator('#loginId').press('Tab');
  await page.locator('#uiPwd').fill('Abcd@1243');

  const newPagePromise = context.waitForEvent('page', { timeout: 10_000 }).catch(() => null);
  await page.locator('#userLogin').click();
  const newTab = await newPagePromise;
  const app = newTab ?? page;

  await app.waitForLoadState('domcontentloaded');
  await app.bringToFront();
  await app.locator('a.item-nav, li#Masters, ul.lst-main-nav, .main-nav').first()
    .waitFor({ state: 'attached', timeout: 30_000 });

  await app.waitForTimeout(2_000);
  console.log('\n✅ Logged in. Page URL:', app.url());
  console.log('👉 Inspect the page now. Press Ctrl+C when done.\n');

  // Keep browser open indefinitely
  await new Promise(() => {});
})();
