import { chromium, Page } from 'playwright';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.bccb.qa') });

const BASE_URL   = process.env.BASE_URL!;
const APP_PATH   = process.env.CBS_APP_PATH!;
const MAKER_USER = process.env.MAKER_USERNAME!;
const MAKER_PASS = process.env.MAKER_PASSWORD!;

async function dumpForm(pg: Page, label: string) {
  console.log(`\n${'='.repeat(70)}\n${label}\n${'='.repeat(70)}`);

  // selects with options
  const selCount = await pg.locator('select:visible').count();
  console.log(`\n[SELECTS: ${selCount}]`);
  for (let i = 0; i < selCount; i++) {
    const el  = pg.locator('select:visible').nth(i);
    const id  = await el.getAttribute('id').catch(() => '') ?? '';
    const dis = await el.isDisabled().catch(() => false);
    const req = await el.getAttribute('required').catch(() => null);
    let lbl = '';
    try { lbl = await pg.locator(`label[for="${id}"]`).first().innerText({ timeout: 300 }).catch(() => ''); } catch {}
    const opts = await el.evaluate((s: any) =>
      Array.from((s as HTMLSelectElement).options).map((o: any) => `${o.value}|||${o.text.trim()}`)
    ).catch(() => [] as string[]);
    const optsArr = Array.isArray(opts) ? opts : [];
    console.log(`  SELECT id="${id}" label="${lbl}" required=${req !== null} disabled=${dis} options=${optsArr.length}`);
    optsArr.forEach((o: string) => console.log(`    ${o}`));
  }

  // text/date inputs
  const inpCount = await pg.locator('input:visible:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]):not([type="file"])').count();
  console.log(`\n[TEXT INPUTS: ${inpCount}]`);
  for (let i = 0; i < inpCount; i++) {
    const el  = pg.locator('input:visible:not([type="radio"]):not([type="checkbox"]):not([type="hidden"]):not([type="file"])').nth(i);
    const id  = await el.getAttribute('id').catch(() => '') ?? '';
    const type = await el.getAttribute('type').catch(() => '') ?? 'text';
    const ml  = await el.getAttribute('maxlength').catch(() => '') ?? '';
    const pat = await el.getAttribute('pattern').catch(() => '') ?? '';
    const req = await el.getAttribute('required').catch(() => null);
    const ro  = await el.getAttribute('readonly').catch(() => null);
    const dis = await el.isDisabled().catch(() => false);
    let lbl = '';
    try { lbl = await pg.locator(`label[for="${id}"]`).first().innerText({ timeout: 300 }).catch(() => ''); } catch {}
    console.log(`  INPUT id="${id}" type="${type}" label="${lbl}" required=${req !== null} readonly=${ro !== null} disabled=${dis} maxlength="${ml}" pattern="${pat}"`);
  }

  // radios
  const radCount = await pg.locator('input[type="radio"]:visible').count();
  if (radCount > 0) {
    console.log(`\n[RADIOS: ${radCount}]`);
    for (let i = 0; i < radCount; i++) {
      const el  = pg.locator('input[type="radio"]:visible').nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const nm  = await el.getAttribute('name').catch(() => '') ?? '';
      const val = await el.getAttribute('value').catch(() => '') ?? '';
      const chk = await el.isChecked().catch(() => false);
      const dis = await el.isDisabled().catch(() => false);
      let lbl = '';
      try { lbl = await pg.locator(`label[for="${id}"]`).first().innerText({ timeout: 300 }).catch(() => ''); } catch {}
      console.log(`  RADIO id="${id}" name="${nm}" value="${val}" checked=${chk} disabled=${dis} label="${lbl}"`);
    }
  }

  // buttons
  const btnCount = await pg.locator('button:visible, input[type="button"]:visible, input[type="submit"]:visible').count();
  console.log(`\n[BUTTONS: ${btnCount}]`);
  for (let i = 0; i < btnCount; i++) {
    const el  = pg.locator('button:visible, input[type="button"]:visible, input[type="submit"]:visible').nth(i);
    const id  = await el.getAttribute('id').catch(() => '') ?? '';
    const txt = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 60);
    const dis = await el.isDisabled().catch(() => false);
    console.log(`  BUTTON id="${id}" text="${txt}" disabled=${dis}`);
  }

  // action links
  const lnkCount = await pg.locator('a[id]:visible, a.button:visible, a.btn:visible').count();
  if (lnkCount > 0) {
    console.log(`\n[ACTION LINKS: ${lnkCount}]`);
    for (let i = 0; i < Math.min(lnkCount, 30); i++) {
      const el  = pg.locator('a[id]:visible, a.button:visible, a.btn:visible').nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const txt = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 60);
      const cls = await el.getAttribute('class').catch(() => '') ?? '';
      console.log(`  LINK id="${id}" text="${txt}" class="${cls}"`);
    }
  }

  // tables
  const tblCount = await pg.locator('table:visible').count();
  if (tblCount > 0) {
    console.log(`\n[TABLES: ${tblCount}]`);
    for (let i = 0; i < tblCount; i++) {
      const tbl  = pg.locator('table:visible').nth(i);
      const id   = await tbl.getAttribute('id').catch(() => '') ?? '';
      const rows = await tbl.locator('tbody tr').count().catch(() => 0);
      const hdrs = await tbl.locator('th').allInnerTexts().catch(() => [] as string[]);
      console.log(`  TABLE id="${id}" rows=${rows} headers=${JSON.stringify(hdrs)}`);
    }
  }

  // modals
  const modCount = await pg.locator('.modal:visible, [role="dialog"]:visible').count();
  if (modCount > 0) {
    console.log(`\n[MODALS: ${modCount}]`);
    for (let i = 0; i < modCount; i++) {
      const m   = pg.locator('.modal:visible, [role="dialog"]:visible').nth(i);
      const id  = await m.getAttribute('id').catch(() => '') ?? '';
      const txt = (await m.innerText().catch(() => '')).replace(/\s+/g, ' ').trim().slice(0, 200);
      console.log(`  MODAL id="${id}" text="${txt}"`);
    }
  }

  // toasts
  const toastCount = await pg.locator('.msg-toast:visible').count();
  if (toastCount > 0) {
    console.log(`\n[TOASTS: ${toastCount}]`);
    for (let i = 0; i < toastCount; i++) {
      const t   = pg.locator('.msg-toast:visible').nth(i);
      const cls = await t.getAttribute('class').catch(() => '') ?? '';
      const txt = (await t.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      console.log(`  TOAST class="${cls}" text="${txt}"`);
    }
  }

  // select2
  const s2Count = await pg.locator('[id$="-container"][class*="select2"]:visible').count();
  if (s2Count > 0) {
    console.log(`\n[SELECT2: ${s2Count}]`);
    for (let i = 0; i < s2Count; i++) {
      const el  = pg.locator('[id$="-container"][class*="select2"]:visible').nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const txt = (await el.innerText().catch(() => '')).replace(/\s+/g, ' ').trim();
      console.log(`  S2 id="${id}" text="${txt}"`);
    }
  }

  // file inputs
  const fileCount = await pg.locator('input[type="file"]').count();
  if (fileCount > 0) {
    console.log(`\n[FILE INPUTS: ${fileCount}]`);
    for (let i = 0; i < fileCount; i++) {
      const el  = pg.locator('input[type="file"]').nth(i);
      const id  = await el.getAttribute('id').catch(() => '') ?? '';
      const acc = await el.getAttribute('accept').catch(() => '') ?? '';
      console.log(`  FILE id="${id}" accept="${acc}"`);
    }
  }
}

(async () => {
  const browser = await chromium.launch({ headless: false }); // headed so new tab opens properly
  const ctx     = await browser.newContext({ viewport: null });

  // login
  const loginPage = await ctx.newPage();
  await loginPage.goto(`${BASE_URL}${APP_PATH}`, { waitUntil: 'domcontentloaded' });
  await loginPage.waitForSelector('#loginId', { timeout: 20000 });
  await loginPage.locator('#loginId').fill(MAKER_USER);
  await loginPage.locator('#uiPwd').fill(MAKER_PASS);

  const [dashTab] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 20000 }).catch(() => null),
    loginPage.locator('#userLogin').click(),
  ]);
  const appPage: Page = dashTab ?? loginPage;
  await appPage.waitForLoadState('domcontentloaded').catch(() => {});
  await appPage.waitForTimeout(3000);
  await appPage.bringToFront();
  console.log('App URL:', appPage.url());

  // navigate to customer
  const ham = appPage.locator('a.item-nav').first();
  await ham.waitFor({ state: 'visible', timeout: 15000 });
  const box = await appPage.locator('li#Masters > a.dropnav').boundingBox().catch(() => null);
  if (box && box.width <= 100) { await ham.click(); await appPage.waitForTimeout(800); }
  const mt = appPage.locator('li#Masters > a.dropnav');
  if (!(await mt.getAttribute('class').catch(() => '') ?? '').includes('mn-open')) { await mt.click({ force: true }); await appPage.waitForTimeout(500); }
  const cm = appPage.locator('li#customermgmt > a.s-dropnav');
  await cm.waitFor({ state: 'attached', timeout: 8000 });
  if (!(await cm.getAttribute('class').catch(() => '') ?? '').includes('smn-open')) { await cm.click({ force: true }); await appPage.waitForTimeout(800); }
  await appPage.locator('li#CUSTOMER > a').waitFor({ state: 'visible', timeout: 10000 });
  await appPage.locator('li#CUSTOMER > a').click();
  await appPage.waitForTimeout(2000);
  console.log('Customer list URL:', appPage.url());

  // open create form — wait for new tab
  const [createTab] = await Promise.all([
    ctx.waitForEvent('page', { timeout: 30000 }),
    appPage.locator('#addButton').click({ force: true }),
  ]);
  await createTab.waitForLoadState('domcontentloaded');
  await createTab.waitForTimeout(2500);
  await createTab.bringToFront();
  console.log('Create form URL:', createTab.url());

  // PAGE 1 — initial
  await dumpForm(createTab, 'PAGE 1 — BASIC DETAILS (initial, no category)');

  // PAGE 1 — Individual
  await createTab.locator('#customerCategory').selectOption('1').catch(() => {});
  await createTab.waitForTimeout(1500);
  await dumpForm(createTab, 'PAGE 1 — BASIC DETAILS (customerCategory=1 Individual/Retail)');

  // customerCategory all options
  const catOpts = await createTab.locator('#customerCategory option').all();
  console.log('\n[customerCategory ALL OPTIONS]');
  for (const o of catOpts) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }

  // DOB → gender
  await createTab.locator('#memberDOB').fill('15-06-1985').catch(() => {});
  await createTab.locator('#memberDOB').press('Tab');
  await createTab.waitForTimeout(1500);
  await dumpForm(createTab, 'PAGE 1 — BASIC DETAILS (after DOB — gender enabled)');

  // PAGE 2
  await createTab.locator('#memberFName').fill('Rajesh').catch(() => {});
  await createTab.locator('#memberLName').fill('Sharma').catch(() => {});
  await createTab.locator('#nextBtn').waitFor({ state: 'visible', timeout: 10000 });
  await createTab.locator('#nextBtn').click();
  await createTab.waitForTimeout(2000);
  await dumpForm(createTab, 'PAGE 2 — CONTACT DETAILS (initial)');

  await createTab.locator('#countryCode').selectOption('1').catch(() => {});
  await createTab.waitForTimeout(1500);
  await dumpForm(createTab, 'PAGE 2 — CONTACT DETAILS (countryCode=1 India)');

  // state options
  const stOpts = await createTab.locator('#stateCode option').all();
  console.log(`\n[stateCode OPTIONS: ${stOpts.length}]`);
  for (const o of stOpts.slice(0, 15)) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }

  if (stOpts.length > 1) {
    const sv = await stOpts[1].getAttribute('value').catch(() => '');
    if (sv) { await createTab.locator('#stateCode').selectOption(sv).catch(() => {}); await createTab.waitForTimeout(1500); }
  }
  await dumpForm(createTab, 'PAGE 2 — CONTACT DETAILS (state selected)');

  const distOpts = await createTab.locator('#districtCode option').all();
  console.log(`\n[districtCode OPTIONS: ${distOpts.length}]`);
  for (const o of distOpts.slice(0, 10)) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }

  if (distOpts.length > 1) {
    const dv = await distOpts[1].getAttribute('value').catch(() => '');
    if (dv) { await createTab.locator('#districtCode').selectOption(dv).catch(() => {}); await createTab.waitForTimeout(1500); }
  }
  await dumpForm(createTab, 'PAGE 2 — CONTACT DETAILS (district selected)');

  // PAGE 3
  await createTab.locator('#address1').fill('12 Rabindra Sarani').catch(() => {});
  await createTab.locator('#nextBtn').waitFor({ state: 'visible', timeout: 10000 });
  await createTab.locator('#nextBtn').click();
  await createTab.waitForTimeout(2000);
  await dumpForm(createTab, 'PAGE 3 — ADDITIONAL DETAILS (initial)');

  const occOpts = await createTab.locator('#occupation option').all();
  console.log(`\n[occupation OPTIONS: ${occOpts.length}]`);
  for (const o of occOpts) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }
  if (occOpts.length > 1) {
    const ov = await occOpts[1].getAttribute('value').catch(() => '');
    if (ov) { await createTab.locator('#occupation').selectOption(ov).catch(() => {}); await createTab.waitForTimeout(1000); }
  }
  await dumpForm(createTab, 'PAGE 3 — ADDITIONAL DETAILS (occupation selected)');

  const frzOpts = await createTab.locator('#freezeType option').all();
  console.log(`\n[freezeType OPTIONS: ${frzOpts.length}]`);
  for (const o of frzOpts) {
    const v = await o.getAttribute('value').catch(() => '');
    const t = await o.innerText().catch(() => '');
    console.log(`  value="${v}" text="${t.trim()}"`);
  }
  if (frzOpts.length > 1) {
    const fv = await frzOpts[1].getAttribute('value').catch(() => '');
    if (fv) { await createTab.locator('#freezeType').selectOption(fv).catch(() => {}); await createTab.waitForTimeout(1000); }
  }
  await dumpForm(createTab, 'PAGE 3 — ADDITIONAL DETAILS (freezeType selected)');

  // PAGE 4
  await createTab.locator('#nextBtn').waitFor({ state: 'visible', timeout: 10000 });
  await createTab.locator('#nextBtn').click();
  await createTab.waitForTimeout(2000);
  await dumpForm(createTab, 'PAGE 4 — DOCUMENT DETAILS (initial)');

  const ptOpts = await createTab.locator('#proofType option').all();
  console.log(`\n[proofType OPTIONS: ${ptOpts.length}]`);
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
    console.log(`\n[docType OPTIONS for proofType="${pv}": ${dtOpts.length}]`);
    for (const d of dtOpts) {
      const dv = await d.getAttribute('value').catch(() => '');
      const dt = await d.innerText().catch(() => '');
      console.log(`  value="${dv}" text="${dt.trim()}"`);
    }
    await dumpForm(createTab, `PAGE 4 — DOCUMENT DETAILS (proofType=${pv})`);
  }

  // fill doc and add
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
    await dumpForm(createTab, 'PAGE 4 — DOCUMENT DETAILS (after Add — second doc row)');
  }

  // save
  const saveBtn = createTab.locator('#saveMemberDetails, #saveCustomerDetails, #saveDepositeparamDetails').filter({ visible: true }).first();
  if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
    await saveBtn.click().catch(() => {});
    await createTab.waitForTimeout(1500);
    await dumpForm(createTab, 'PAGE 4 — AFTER SAVE CLICK (confirmation modal)');
  }

  await browser.close();
  console.log('\nDONE');
})();
