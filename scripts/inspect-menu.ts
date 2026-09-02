import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page    = await context.newPage();

  // Login
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

  // Wait for nav
  await app.locator('a.item-nav, li#Masters, ul.lst-main-nav, .main-nav').first()
    .waitFor({ state: 'attached', timeout: 30_000 });

  await app.waitForTimeout(2_000);

  // Check sidebar width and hamburger
  const mastersBox = await app.locator('li#Masters').boundingBox().catch(() => null);
  console.log('li#Masters boundingBox:', mastersBox);

  const mastersHtml = await app.locator('li#Masters').innerHTML().catch((e: Error) => 'ERR: ' + e.message);
  console.log('\nli#Masters innerHTML (first 600):', mastersHtml.substring(0, 600));

  // Find hamburger candidates
  const hamburgerCandidates = [
    'a.item-nav', '#sidebarToggle', '.sidebar-toggle',
    '[class*="hamburger"]', '[id*="toggle"]', '[class*="toggle"]',
    'button.toggle', 'a[class*="nav"]',
  ];
  for (const sel of hamburgerCandidates) {
    const cnt = await app.locator(sel).count();
    if (cnt > 0) {
      const vis = await app.locator(sel).first().isVisible().catch(() => false);
      const box = await app.locator(sel).first().boundingBox().catch(() => null);
      const cls = await app.locator(sel).first().getAttribute('class').catch(() => '');
      console.log(`${sel.padEnd(30)} count=${cnt} visible=${vis} box=${JSON.stringify(box)} class=${cls}`);
    }
  }

  // Check specific selectors
  const checks = [
    'li#Masters',
    'li#Masters > a',
    'li#Masters > a.dropnav',
    'li#customermgmt',
    'li#customermgmt > a',
    'li#customermgmt > a.s-dropnav',
    'li#CUSTOMER',
    'li#CUSTOMER > a',
  ];
  for (const sel of checks) {
    const count = await app.locator(sel).count();
    const vis   = count > 0 ? await app.locator(sel).first().isVisible().catch(() => false) : false;
    console.log(`${sel.padEnd(35)} count=${count} visible=${vis}`);
  }

  await app.screenshot({ path: 'scripts/menu-state.png', fullPage: false });
  console.log('\nScreenshot saved: scripts/menu-state.png');

  await browser.close();
})();
