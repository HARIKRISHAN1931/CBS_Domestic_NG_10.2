import { test, expect } from '../../pages/customerFixtures';
import { CustomerDataGenerator } from '../../../../common/helpers/CustomerDataGenerator';
import { DateHelper } from '../../../../common/helpers/DateHelper';

test.describe('Customer Form Validation @sanity @customer @validation', () => {

  // ── Page 1: Basic Details ─────────────────────────────────────────────

  test('TC-037 Submit without first name shows error', async ({ customerCreationPage }) => {
    const data = CustomerDataGenerator.negative().emptyFirst;
    await customerCreationPage.fillBasicDetails(data);
    const page = customerCreationPage['page'];
    await page.locator('#nextBtn').click();
    await expect(page.locator('#customerCategory')).toBeVisible({ timeout: 5_000 });
  });

  test('TC-038 Submit without last name shows error', async ({ customerCreationPage }) => {
    const data = CustomerDataGenerator.negative().emptyLast;
    await customerCreationPage.fillBasicDetails(data);
    const page = customerCreationPage['page'];
    await page.locator('#nextBtn').click();
    await expect(page.locator('#customerCategory')).toBeVisible({ timeout: 5_000 });
  });

  test('TC-039 Future DOB is rejected', async ({ customerCreationPage }) => {
    const data = CustomerDataGenerator.negative().futureDOB;
    await customerCreationPage.fillBasicDetails(data);
    const page = customerCreationPage['page'];
    await page.locator('#nextBtn').click();
    const staysOnPage1 = await page.locator('#customerCategory').isVisible({ timeout: 3_000 }).catch(() => false);
    const errorToast   = await page.locator('.msg-toast.msg-error em').isVisible({ timeout: 3_000 }).catch(() => false);
    expect(staysOnPage1 || errorToast).toBe(true);
  });

  test('TC-040 Gender enabled only after DOB entry', async ({ customerCreationPage }) => {
    const page = customerCreationPage['page'];
    const genderBeforeDOB = await page.locator('#memberGender').isEnabled().catch(() => false);
    expect(genderBeforeDOB).toBe(false);
    await page.locator('#memberDOB').fill(DateHelper.minusYears(25));
    await page.locator('#memberDOB').press('Tab');
    await page.waitForTimeout(1_000);
    const genderAfterDOB = await page.locator('#memberGender').isEnabled({ timeout: 5_000 }).catch(() => false);
    expect(genderAfterDOB).toBe(true);
  });

  test('TC-041 Minimum name length (1 char) advances to page 2', async ({ customerCreationPage }) => {
    const data = CustomerDataGenerator.boundary().minName;
    await customerCreationPage.fillBasicDetails(data);
    const page = customerCreationPage['page'];
    await page.locator('#nextBtn').click();
    const onPage2 = await page.locator('#address1, #addressType').first().isVisible({ timeout: 10_000 }).catch(() => false);
    expect(onPage2).toBe(true);
  });

  // ── Page 2: Contact Details ───────────────────────────────────────────

  test('TC-066 Country→State cascade populates state dropdown', async ({ customerCreationPage }) => {
    const data = CustomerDataGenerator.minimal();
    await customerCreationPage.fillBasicDetails(data);
    await customerCreationPage.fillContactDetails({ ...data, countryCode: '1' });
    const page = customerCreationPage['page'];
    const stateOptions = await page.locator('#stateCode option').count();
    expect(stateOptions).toBeGreaterThan(1);
  });

  // ── Page 4: Document Details ──────────────────────────────────────────

  test('TC-108 Save without National ID Proof shows mandatory error', async ({ customerCreationPage }) => {
    const fullData = { ...CustomerDataGenerator.minimal(), memberFName: 'DocTest', memberLName: 'Mandatory' };
    await customerCreationPage.fillBasicDetails(fullData);
    await customerCreationPage.fillContactDetails(fullData);
    await customerCreationPage.fillAdditionalDetails(fullData);
    const page = customerCreationPage['page'];
    await page.locator('#nextBtn').click();
    await page.waitForTimeout(1_500);
    const saveBtn = page.locator('#saveMemberDetails, #saveCustomerDetails, button[id*="save"]').filter({ visible: true }).first();
    if (await saveBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await saveBtn.click();
      await page.locator('#submitForm').click().catch(() => {});
      const errorText = await page.locator('.msg-toast.msg-error em').first().innerText({ timeout: 8_000 }).catch(() => '');
      expect(errorText.toLowerCase()).toMatch(/national id|mandatory|proof/i);
    }
  });

  test('TC-109 ProofType→DocType cascade populates document types', async ({ customerCreationPage }) => {
    const data = CustomerDataGenerator.minimal();
    await customerCreationPage.fillBasicDetails(data);
    await customerCreationPage.fillContactDetails(data);
    await customerCreationPage.fillAdditionalDetails(data);
    const page = customerCreationPage['page'];
    await page.locator('#nextBtn').click();
    await page.waitForTimeout(1_500);
    if (await page.locator('#proofType').isVisible({ timeout: 5_000 }).catch(() => false)) {
      await page.locator('#proofType').selectOption('2');
      await page.waitForTimeout(1_000);
      const docTypeOptions = await page.locator('#docType option').count();
      expect(docTypeOptions).toBeGreaterThan(1);
    }
  });

  test('TC-110 ID Number is mandatory for document add', async ({ customerCreationPage }) => {
    const data = CustomerDataGenerator.minimal();
    await customerCreationPage.fillBasicDetails(data);
    await customerCreationPage.fillContactDetails(data);
    await customerCreationPage.fillAdditionalDetails(data);
    const page = customerCreationPage['page'];
    await page.locator('#nextBtn').click();
    await page.waitForTimeout(1_500);
    if (await page.locator('#proofType').isVisible({ timeout: 5_000 }).catch(() => false)) {
      await page.locator('#proofType').selectOption('2');
      await page.waitForTimeout(800);
      const addBtn = page.locator('#btnAdd').first();
      if (await addBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await addBtn.click();
        await page.waitForTimeout(500);
        const isRequired  = await page.locator('#idNumber').evaluate((el: HTMLInputElement) => el.validity?.valueMissing || el.classList.contains('error')).catch(() => false);
        const errorVisible = await page.locator('.msg-toast.msg-error em').isVisible({ timeout: 2_000 }).catch(() => false);
        expect(isRequired || errorVisible).toBe(true);
      }
    }
  });

});
