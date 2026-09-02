import { chromium, Page } from 'playwright';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.bccb.qa') });

const BASE_URL     = process.env.BASE_URL!;
const APP_PATH     = process.env.CBS_APP_PATH!;
const MAKER_USER   = process.env.MAKER_USERNAME!;
const MAKER_PASS   = process.env.MAKER_PASSWORD!;
const CHECKER_USER = process.env.CHECKER_USERNAME!;
const CHECKER_PASS = process.env.CHECKER_PASSWORD!;

async function dump(pg: Page, label: string) {
  console.log(`\n${'='.repeat(80)}\nSECTION: ${label}\n${'='.repeat(80)}`);

  // ── inputs ──
  const inputs = pg.locator('input:visible, textarea:visible');
  const inCount = await inputs.count();
  console.log(`\n--- INPUTS (${inCount}) ---`);
  for (let i = 0; i < inCount; i++) {
    const el = inputs.nth(i);
    const id   = await el.getAttribute('id').catch(() => '') ?? '';
    const type = await el.getAttribute('type').catch(() => '') ?? '';
    const ph   = await el.getAttribute('placeholder').catch(() => '') ?? '';
    const ml   = await el.getAttribute('maxlength').catch(() => '') ?? '';
    const pat  = await el.getAttribute('pattern').catch(() => '') ?? '';
    const req  = await el.getAttribute('required').catch(() => null);
    const ro   = await el.getAttribute('readonly').catch(() => null);
    const dis  = await el.isDisabled().catch(() => false);
    const val  = await el.inputValue().catch(() => '');
    if (['hidden', 'file'].includes(type)) continue;
    // find label
    let lbl = '';
    try {
      lbl = await pg.locator(`label[for="${id}"]`).first().innerText({ timeout: 300 }).catch(() => '');
    } catch {}
    console.log(`  id="${id}" type="${type}" label="${lbl}" placeholder="${ph}" required=${req !== null} readonly=${ro !== null} disabled=${dis} maxlength="${ml}" pattern="${pat}" value="${val.slice(0,30)}"`);
  }

  // ── selects ──
  const selects = pg.locator('select:visible');
  const selCount = await selects.count();
  console.log(`\n--- SELECTS (${selCount}) ---`);
  for (let i = 0; i < selCount; i++) {
    const el  = selects.nth(i);
    const id  = await el.getAttribute('id').catch(() => '') ?? '';
    const dis = await el.isDisabled().catch(() => false);
    const req = await el.getAttribute('required').catch(() => null);
    let lbl = '';
    try { lbl = await pg.locator(`label[for="${id}"]`).first().innerText({ timeout: 300 }).catch(() => ''); } catch {}
    // get options via evaluate on the specific element
    const opts = await el.evaluate((s: any) =>
      Array.from(s.options).map((o: any) => `${o.value}:${o.text.trim()}`)
    ).catch(() => [] as string[]);
    const optsArr = Array.isArray(opts) ? opts : [];
    console.log(`  id="${id}" label="${lbl}" required=${req !== null} disabled=${dis}`);
    if (optsArr.length < 60) optsArr.forEach((o: string) => console.log(`      opt: ${o}`));
    else console.log(`      [${optsArr.length} options]`);
  }

  // ── radios ──
  const radios = pg.locator('input[type="radio"]:visible');
  const rCount = await radios.count();
  if (rCount > 0) {
    console.log(`\n--- RADIO BUTTONS (${rCount}) ---`);
    for (let i = 0; i < rCount; i++) {
      const el   = radios.nth(i);
      const id   = await el.getAttribute('id').catch(() => '') ?? '';
      const name = await el.getAttribute('name').catch(() => '') ?? '';
      const val  = await el.getAttribute('value').catch(() => '') ?? '';
      const chk  = await el.isChecked().catch(() => false);
      const dis  = await el.isDisabled().catch(() => false);
      let lbl = '';
      try { lbl = await pg.locator(`label[for="${id}"]`).first().innerText({ timeout: 300 }).catch(() => ''); } catch {}
      console.log(`  id="${id}" name="${name}" value="${val}" checked=${chk} disabled=${dis} label="${lbl}"`);
    }
  }

  // ── checkboxes ──
  const cbs = pg.locator('input[type="checkbox"]:visible');
  const cbCount = await cbs.count();
  if (cbCount > 0) {
    console.log(`\n--- CHECKBOXES (${cbCount}) ---`);
    for (let i = 0; i < cbCount; i++) {
      const el  = cbs.nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const chk = await el.isChecked().catch(() => false);
      const dis = await el.isDisabled().catch(() => false);
      let lbl = '';
      try { lbl = await pg.locator(`label[for="${id}"]`).first().innerText({ timeout: 300 }).catch(() => ''); } catch {}
      console.log(`  id="${id}" checked=${chk} disabled=${dis} label="${lbl}"`);
    }
  }

  // ── buttons ──
  const btns = pg.locator('button:visible, input[type="button"]:visible, input[type="submit"]:visible');
  const bCount = await btns.count();
  console.log(`\n--- BUTTONS (${bCount}) ---`);
  for (let i = 0; i < bCount; i++) {
    const el  = btns.nth(i);
    const id  = await el.getAttribute('id').catch(() => '') ?? '';
    const txt = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 60);
    const dis = await el.isDisabled().catch(() => false);
    console.log(`  id="${id}" text="${txt}" disabled=${dis}`);
  }

  // ── action links (CBS uses <a> for buttons) ──
  const links = pg.locator('a.button:visible, a.btn:visible, a[onclick]:visible, a[id]:visible');
  const lCount = await links.count();
  if (lCount > 0) {
    console.log(`\n--- ACTION LINKS (${lCount}) ---`);
    for (let i = 0; i < Math.min(lCount, 40); i++) {
      const el  = links.nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const txt = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 60);
      const oc  = (await el.getAttribute('onclick').catch(() => '') ?? '').slice(0, 60);
      const cls = await el.getAttribute('class').catch(() => '') ?? '';
      console.log(`  id="${id}" text="${txt}" onclick="${oc}" class="${cls}"`);
    }
  }

  // ── tabs ──
  const tabs = pg.locator('#PendingList:visible, #AuthorizedList:visible, #RejectedList:visible, [role="tab"]:visible');
  const tCount = await tabs.count();
  if (tCount > 0) {
    console.log(`\n--- TABS (${tCount}) ---`);
    for (let i = 0; i < tCount; i++) {
      const el  = tabs.nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const txt = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      console.log(`  id="${id}" text="${txt}"`);
    }
  }

  // ── tables ──
  const tables = pg.locator('table:visible');
  const tbCount = await tables.count();
  if (tbCount > 0) {
    console.log(`\n--- TABLES (${tbCount}) ---`);
    for (let i = 0; i < tbCount; i++) {
      const tbl  = tables.nth(i);
      const id   = await tbl.getAttribute('id').catch(() => '') ?? '';
      const rows = await tbl.locator('tbody tr').count().catch(() => 0);
      const hdrs = await tbl.locator('th').allInnerTexts().catch(() => [] as string[]);
      console.log(`  id="${id}" rows=${rows} headers=${JSON.stringify(hdrs)}`);
    }
  }

  // ── modals ──
  const modals = pg.locator('.modal:visible, [role="dialog"]:visible');
  const mCount = await modals.count();
  if (mCount > 0) {
    console.log(`\n--- MODALS (${mCount}) ---`);
    for (let i = 0; i < mCount; i++) {
      const m   = modals.nth(i);
      const id  = await m.getAttribute('id').catch(() => '') ?? '';
      const txt = (await m.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 200);
      console.log(`  id="${id}" text="${txt}"`);
    }
  }

  // ── toasts ──
  const toasts = pg.locator('.msg-toast:visible, [role="alert"]:visible');
  const toCount = await toasts.count();
  if (toCount > 0) {
    console.log(`\n--- TOASTS (${toCount}) ---`);
    for (let i = 0; i < toCount; i++) {
      const t   = toasts.nth(i);
      const cls = await t.getAttribute('class').catch(() => '') ?? '';
      const txt = (await t.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 100);
      console.log(`  class="${cls}" text="${txt}"`);
    }
  }

  // ── select2 ──
  const s2 = pg.locator('[id$="-container"][class*="select2"]:visible');
  const s2Count = await s2.count();
  if (s2Count > 0) {
    console.log(`\n--- SELECT2 WIDGETS (${s2Count}) ---`);
    for (let i = 0; i < s2Count; i++) {
      const el  = s2.nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const txt = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      console.log(`  id="${id}" currentText="${txt}"`);
    }
  }

  // ── file inputs ──
  const files = pg.locator('input[type="file"]');
  const fCount = await files.count();
  if (fCount > 0) {
    console.log(`\n--- FILE INPUTS (${fCount}) ---`);
    for (let i = 0; i < fCount; i++) {
      const el  = files.nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const acc = await el.getAttribute('accept').catch(() => '') ?? '';
      console.log(`  id="${id}" accept="${acc}"`);
    }
  }

  // ── page title ──
  const titleEl = pg.locator('h1:visible, h2:visible, h3:visible, .page-title:visible, .panel-title:visible, .screen-title:visible').first();
  if (await titleEl.isVisible({ timeout: 500 }).catch(() => false)) {
    const t = (await titleEl.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
    console.log(`\n--- PAGE TITLE: "${t}" ---`);
  }
}

async function loginAndGetAppPage(ctx: any, user: string, pass: string): Promise<Page> {
  const loginPage = await ctx.newPage();
  await loginPage.goto(`${BASE_URL}${APP_PATH}`, { waitUntil: 'domcontentloaded' });
  await loginPage.waitForSelector('#loginId', { timeout: 20000 });
  await loginPage.locator('#loginId').fill(user);
  await loginPage.locator('#uiPwd').fill(pass);
  const [newTab] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 20000 }).catch(() => null),
    loginPage.locator('#userLogin').click(),
  ]);
  const appPage: Page = newTab ?? loginPage;
  await appPage.waitForLoadState('domcontentloaded').catch(() => {});
  await appPage.waitForTimeout(3000);
  await appPage.bringToFront();
  console.log(`Logged in as ${user}. URL: ${appPage.url()}`);
  return appPage;
}

async function navigateToCustomer(pg: Page) {
  const hamburger = pg.locator('a.item-nav').first();
  await hamburger.waitFor({ state: 'visible', timeout: 15000 });
  const box = await pg.locator('li#Masters > a.dropnav').boundingBox().catch(() => null);
  if (box && box.width <= 100) { await hamburger.click(); await pg.waitForTimeout(800); }
  const mt = pg.locator('li#Masters > a.dropnav');
  const mc = await mt.getAttribute('class').catch(() => '');
  if (!(mc ?? '').includes('mn-open')) { await mt.click({ force: true }); await pg.waitForTimeout(500); }
  const cm = pg.locator('li#customermgmt > a.s-dropnav');
  await cm.waitFor({ state: 'attached', timeout: 8000 });
  const cc = await cm.getAttribute('class').catch(() => '');
  if (!(cc ?? '').includes('smn-open')) { await cm.click({ force: true }); await pg.waitForTimeout(800); }
  const ci = pg.locator('li#CUSTOMER > a');
  await ci.waitFor({ state: 'visible', timeout: 10000 });
  await ci.click();
  await pg.waitForTimeout(2000);
  console.log('Customer list URL:', pg.url());
}

(async () => {
  const browser   = await chromium.launch({ headless: true });
  const makerCtx  = await browser.newContext({ viewport: null });
  const makerPage = await loginAndGetAppPage(makerCtx, MAKER_USER, MAKER_PASS);
  await navigateToCustomer(makerPage);

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  await dump(makerPage, 'LIST VIEW — Pending Tab');

  await makerPage.locator('#AuthorizedList').click().catch(() => {});
  await makerPage.waitForTimeout(1000);
  await dump(makerPage, 'LIST VIEW — Authorized Tab');

  // hover authorized row
  const authRow = makerPage.locator('#dt-authdata tbody tr').first();
  if (await authRow.isVisible({ timeout: 5000 }).catch(() => false)) {
    await authRow.hover();
    await makerPage.waitForTimeout(500);
    await dump(makerPage, 'LIST VIEW — Authorized Row Hovered');
  }

  await makerPage.locator('#RejectedList').click().catch(() => {});
  await makerPage.waitForTimeout(1000);
  await dump(makerPage, 'LIST VIEW — Rejected Tab');

  // ── CREATE FORM ────────────────────────────────────────────────────────────
  const [createTab] = await Promise.all([
    makerCtx.waitForEvent('page'),
    makerPage.locator('#addButton, button.add, #createButton').first().click({ force: true }),
  ]);
  await createTab.waitForLoadState('domcontentloaded');
  await createTab.waitForTimeout(2000);
  console.log('\nCreate form URL:', createTab.url());

  await dump(createTab, 'PAGE 1 — BASIC DETAILS (initial, no category)');

  await createTab.locator('#customerCategory').selectOption('1').catch(() => {});
  await createTab.waitForTimeout(1500);
  await dump(createTab, 'PAGE 1 — BASIC DETAILS (customerCategory=1 Individual)');

  // dump all customerCategory options
  const catOpts = await createTab.locator('#customerCategory option').all();
  console.log('\n--- customerCategory OPTIONS ---');
  for (const o of catOpts) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }

  await createTab.locator('#memberDOB').fill('15-06-1985').catch(() => {});
  await createTab.locator('#memberDOB').press('Tab');
  await createTab.waitForTimeout(1500);
  await dump(createTab, 'PAGE 1 — BASIC DETAILS (after DOB — gender enabled)');

  // ── PAGE 2 ─────────────────────────────────────────────────────────────────
  await createTab.locator('#memberFName').fill('Rajesh').catch(() => {});
  await createTab.locator('#memberLName').fill('Sharma').catch(() => {});
  const nextBtn = createTab.locator('#nextBtn');
  await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
  await nextBtn.click();
  await createTab.waitForTimeout(2000);
  await dump(createTab, 'PAGE 2 — CONTACT DETAILS (initial)');

  await createTab.locator('#countryCode').selectOption('1').catch(() => {});
  await createTab.waitForTimeout(1500);
  await dump(createTab, 'PAGE 2 — CONTACT DETAILS (countryCode=1 India)');

  const stateOpts = await createTab.locator('#stateCode option').all();
  console.log('\n--- stateCode OPTIONS (first 10) ---');
  for (const o of stateOpts.slice(0, 10)) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }

  if (stateOpts.length > 1) {
    const sv = await stateOpts[1].getAttribute('value').catch(() => '');
    if (sv) { await createTab.locator('#stateCode').selectOption(sv).catch(() => {}); await createTab.waitForTimeout(1500); }
  }
  await dump(createTab, 'PAGE 2 — CONTACT DETAILS (state selected — district populated)');

  const distOpts = await createTab.locator('#districtCode option').all();
  console.log('\n--- districtCode OPTIONS (first 10) ---');
  for (const o of distOpts.slice(0, 10)) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }

  if (distOpts.length > 1) {
    const dv = await distOpts[1].getAttribute('value').catch(() => '');
    if (dv) { await createTab.locator('#districtCode').selectOption(dv).catch(() => {}); await createTab.waitForTimeout(1500); }
  }
  await dump(createTab, 'PAGE 2 — CONTACT DETAILS (district selected — area populated)');

  // ── PAGE 3 ─────────────────────────────────────────────────────────────────
  await createTab.locator('#address1').fill('12 Rabindra Sarani').catch(() => {});
  await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
  await nextBtn.click();
  await createTab.waitForTimeout(2000);
  await dump(createTab, 'PAGE 3 — ADDITIONAL DETAILS (initial)');

  const occOpts = await createTab.locator('#occupation option').all();
  console.log('\n--- occupation OPTIONS ---');
  for (const o of occOpts) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }
  if (occOpts.length > 1) {
    const ov = await occOpts[1].getAttribute('value').catch(() => '');
    if (ov) { await createTab.locator('#occupation').selectOption(ov).catch(() => {}); await createTab.waitForTimeout(1000); }
  }
  await dump(createTab, 'PAGE 3 — ADDITIONAL DETAILS (occupation selected)');

  const frzOpts = await createTab.locator('#freezeType option').all();
  console.log('\n--- freezeType OPTIONS ---');
  for (const o of frzOpts) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }
  if (frzOpts.length > 1) {
    const fv = await frzOpts[1].getAttribute('value').catch(() => '');
    if (fv) { await createTab.locator('#freezeType').selectOption(fv).catch(() => {}); await createTab.waitForTimeout(1000); }
  }
  await dump(createTab, 'PAGE 3 — ADDITIONAL DETAILS (freezeType selected)');

  // ── PAGE 4 ─────────────────────────────────────────────────────────────────
  await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
  await nextBtn.click();
  await createTab.waitForTimeout(2000);
  await dump(createTab, 'PAGE 4 — DOCUMENT DETAILS (initial)');

  const ptOpts = await createTab.locator('#proofType option').all();
  console.log('\n--- proofType OPTIONS ---');
  for (const o of ptOpts) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }

  for (const o of ptOpts) {
    const pv = await o.getAttribute('value').catch(() => '');
    if (!pv) continue;
    await createTab.locator('#proofType').selectOption(pv).catch(() => {});
    await createTab.waitForTimeout(1000);
    const dtOpts = await createTab.locator('#docType option').all();
    console.log(`\n--- docType OPTIONS for proofType="${pv}" ---`);
    for (const d of dtOpts) {
      const dv = await d.getAttribute('value').catch(() => '');
      const dt = await d.innerText().catch(() => '');
      console.log(`  value="${dv}" text="${dt.trim()}"`);
    }
    await dump(createTab, `PAGE 4 — DOCUMENT DETAILS (proofType=${pv})`);
  }

  // Fill doc and click Add
  await createTab.locator('#proofType').selectOption('2').catch(() => {});
  await createTab.waitForTimeout(1000);
  const dtOpts2 = await createTab.locator('#docType option').all();
  if (dtOpts2.length > 1) {
    const dv = await dtOpts2[1].getAttribute('value').catch(() => '');
    if (dv) { await createTab.locator('#docType').selectOption(dv).catch(() => {}); await createTab.waitForTimeout(800); }
  }
  await createTab.locator('#idNumber').fill('ABCDE1234F').catch(() => {});
  await createTab.locator('#issuedDate').fill('01-01-2020').catch(() => {});
  await createTab.locator('#nameAsInDocument').fill('Rajesh Sharma').catch(() => {});

  const addDocBtn = createTab.locator('#btnAdd').first();
  if (await addDocBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await addDocBtn.click().catch(() => {});
    await createTab.waitForTimeout(1500);
    await dump(createTab, 'PAGE 4 — DOCUMENT DETAILS (after Add — second doc row)');
  }

  // Save
  const saveBtn = createTab.locator('#saveMemberDetails, #saveCustomerDetails, #saveDepositeparamDetails').filter({ visible: true }).first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await saveBtn.click().catch(() => {});
    await createTab.waitForTimeout(1500);
    await dump(createTab, 'PAGE 4 — AFTER SAVE CLICK (confirmation modal)');
  }

  // ── CHECKER SESSION ────────────────────────────────────────────────────────
  const checkerCtx  = await browser.newContext({ viewport: null });
  const checkerPage = await loginAndGetAppPage(checkerCtx, CHECKER_USER, CHECKER_PASS);
  await navigateToCustomer(checkerPage);
  await dump(checkerPage, 'CHECKER — LIST VIEW Pending Tab');

  const pendRow = checkerPage.locator('#dt-pendingdata tbody tr').first();
  if (await pendRow.isVisible({ timeout: 5000 }).catch(() => false)) {
    await pendRow.hover();
    await checkerPage.waitForTimeout(500);
    await dump(checkerPage, 'CHECKER — Pending Row Hovered');

    const authBtn = pendRow.locator('.authorization-btns a').first();
    if (await authBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await authBtn.click({ force: true });
      await checkerPage.waitForTimeout(1500);
      await dump(checkerPage, 'CHECKER — Authorization Modal');

      const rejectBtn = checkerPage.locator('#idReject');
      if (await rejectBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await rejectBtn.click().catch(() => {});
        await checkerPage.waitForTimeout(1000);
        await dump(checkerPage, 'CHECKER — Reject Modal');
      }
    }
  }

  await browser.close();
  console.log('\n\nINSPECTION COMPLETE');
})();
