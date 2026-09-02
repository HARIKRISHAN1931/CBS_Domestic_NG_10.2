import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface CorporateCustomerData extends Record<string, unknown> {
  customerCategory?:      string;
  memberFName?:           string;
  shortName?:             string;
  dateOfEstablishment?:   string;
  registrationNo?:        string;
  commencementDate?:      string;
  businessType?:          string;
  subBusinessType?:       string;
  businessSector?:        string;
  typeOfEnterPrice?:      string;
  placeOfEstablishment?:  string;
  taxResidenceStatus?:    string;
  pan?:                   string;
  tinAvailable?:          'Y' | 'N';
  taxIdNo?:               string;
  gstNo?:                 string;
  gstRegDate?:            string;
  annualTurnover?:        string;
  noOfEmployees?:         string;
  sizeOfFirm?:            string;
  custReason?:            string;
  relOff?:                string;
  addressType?:           string;
  address1?:              string;
  address2?:              string;
  address3?:              string;
  pinCode?:               string;
  countryCode?:           string;
  stateCode?:             string;
  districtCode?:          string;
  mobile1CountryCode?:    string;
  mobileNo1?:             string;
  phone?:                 string;
  emailId?:               string;
  contactPerson?:         string;
  website?:               string;
  associationType?:       string;
  proofType?:             string;
  docType?:               string;
  idNumber?:              string;
  issuedDate?:            string;
  expiryDate?:            string;
  nameAsInDocument?:      string;
  recievedDate?:          string;
  issuedByCountry?:       string;
  issuedBy?:              string;
  docUpload?:             string;
  tdsAvailable?:          'Y' | 'N';
  tdsReasonCd?:           string;
  specialInstruct1?:      string;
  specialInstruct2?:      string;
  referBy?:               string;
  lendingUnit?:           string;
  operationCountry?:      string;
}

export class CorporateCustomerPage extends CbsPage {
  protected readonly screenId = 'CORPCUSTOMER';

  constructor(page: Page) { super(page); }

  private f = (id: string): Locator => this.page.locator(`#${id}`).first();

  private inp = async (id: string, val: string, visibleMs = 5_000): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: visibleMs }).catch(() => {});
    await loc.fill(val, { force: true });
    await loc.press('Tab');
  };

  private sel = async (id: string, val: string): Promise<void> => {
    if (!val) return;
    const loc = this.f(id);
    await loc.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await loc.selectOption(val).catch(() => loc.selectOption({ label: val }).catch(() => {}));
  };

  private sel2 = async (id: string, searchText?: string): Promise<void> => {
    if (!searchText) return;
    const container = this.page.locator(`#select2-${id}-container`).first();
    await container.waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
    await container.click({ force: true });
    await this.page.waitForTimeout(200);
    const searchBox = this.page.locator('.select2-search__field').last();
    if (await searchBox.isVisible({ timeout: 400 }).catch(() => false)) {
      const term = searchText.split(/[\s\-]+/).filter(Boolean).pop() ?? searchText;
      await searchBox.fill(term.slice(0, 10));
      await this.page.waitForTimeout(400);
    }
    const opts = await this.page.locator('.select2-results__option:not(.loading-results)').all();
    if (!opts.length) { await this.page.keyboard.press('Escape'); return; }
    for (const opt of opts) {
      const txt = await opt.innerText().catch(() => '');
      if (txt.trim().toLowerCase().includes(searchText.toLowerCase())) { await opt.click({ force: true }); return; }
    }
    await opts[0].click({ force: true });
  };

  private sel2Dep = async (id: string, timeoutMs = 10_000): Promise<void> => {
    const hidden = this.page.locator(`select#${id}`).first();
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      if (await hidden.locator('option').count().catch(() => 0) > 1) break;
      await this.page.waitForTimeout(300);
    }
    const container = this.page.locator(`#select2-${id}-container`).first();
    if (!await container.isVisible({ timeout: 1_000 }).catch(() => false)) return;
    await container.click({ force: true });
    await this.page.waitForTimeout(300);
    const opts = await this.page.locator('.select2-results__option').all();
    if (opts.length > 0) await opts[0].click({ force: true });
  };

  private radio = async (id: string): Promise<void> => { await this.page.locator(`#${id}`).first().click({ force: true }); };

  private async clickNext(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);
    const next = this.page.locator('#nextBtn, #btnNext, button:has-text("Next"), a:has-text("Next"), input[value="Next"]').first();
    await next.waitFor({ state: 'visible', timeout: 15_000 });
    await next.click({ force: true });
    await this.page.waitForTimeout(1_500);
  }

  async openCreateForm(): Promise<void> {
    await this.page.locator('#addButton').waitFor({ state: 'visible', timeout: 15_000 });
    await this.page.locator('#addButton').click();
    await this.f('memberFName').waitFor({ state: 'visible', timeout: 20_000 });
  }

  async fillPage1(data: CorporateCustomerData): Promise<void> {
    if (data.customerCategory)    await this.sel2('customerCategory', data.customerCategory);
    if (data.memberFName)         await this.inp('memberFName', data.memberFName);
    if (data.shortName)           await this.inp('shortName', data.shortName);
    if (data.dateOfEstablishment) await this.inp('dateOfEstablishment', data.dateOfEstablishment);
    if (data.registrationNo)      await this.inp('registrationNo', data.registrationNo);
    if (data.commencementDate)    await this.inp('commencementDate', data.commencementDate);
    if (data.businessType)        await this.sel2('businessType', data.businessType);
    if (data.subBusinessType)     await this.sel2Dep('subBusinessType');
    if (data.businessSector)      await this.sel('businessSector', data.businessSector);
    if (data.typeOfEnterPrice)    await this.sel('typeOfEnterPrice', data.typeOfEnterPrice);
    if (data.taxResidenceStatus)  await this.sel('taxResidenceStatus', data.taxResidenceStatus);
    if (data.pan)                 await this.inp('pan', data.pan);
    if (data.tinAvailable === 'Y') { await this.radio('tinY'); if (data.taxIdNo) await this.inp('taxIdNo', data.taxIdNo); }
    if (data.tinAvailable === 'N') await this.radio('tinN');
    if (data.gstNo)               await this.inp('gstNo', data.gstNo);
    if (data.gstRegDate)          await this.inp('gstRegDate', data.gstRegDate);
    if (data.annualTurnover)      await this.sel('annualTurnover', data.annualTurnover);
    if (data.noOfEmployees)       await this.sel('noOfEmployees', data.noOfEmployees);
    if (data.sizeOfFirm)          await this.sel('sizeOfFirm', data.sizeOfFirm);
    if (data.custReason)          await this.sel('custReason', data.custReason);
    if (data.relOff)              await this.sel2('relOff', data.relOff);
    if (data.addressType)         await this.sel('addressType', data.addressType);
    if (data.address1)            await this.inp('address1', data.address1);
    if (data.address2)            await this.inp('address2', data.address2);
    if (data.address3)            await this.inp('address3', data.address3);
    if (data.pinCode)             await this.inp('pinCode', data.pinCode);
    if (data.countryCode) { await this.sel('countryCode', data.countryCode); await this.page.waitForResponse(r => r.url().includes('getStateByCountry') && r.status() === 200, { timeout: 4_000 }).catch(() => {}); }
    if (data.stateCode)   { await this.sel2('stateCode', data.stateCode); await this.page.waitForResponse(r => r.url().includes('getDistrictByState') && r.status() === 200, { timeout: 4_000 }).catch(() => {}); }
    if (data.districtCode)        await this.sel2Dep('districtCode');
    if (data.mobile1CountryCode)  await this.sel('mobile1CountryCode', data.mobile1CountryCode);
    if (data.mobileNo1)           await this.inp('mobileNo1', data.mobileNo1);
    if (data.phone)               await this.inp('phone', data.phone);
    if (data.emailId)             await this.inp('emailId', data.emailId);
    if (data.contactPerson)       await this.inp('contactPerson', data.contactPerson);
    if (data.website)             await this.inp('website', data.website);
  }

  async fillPage2(data: CorporateCustomerData): Promise<void> {
    if (data.associationType) await this.sel('associationType', data.associationType);
    if (data.proofType) { await this.sel('proofType', data.proofType); await this.page.waitForTimeout(500); }
    const docTypeSel = this.f('docType');
    if (await docTypeSel.isVisible({ timeout: 3_000 }).catch(() => false)) {
      if (data.docType) { await this.sel('docType', data.docType); }
      else {
        const firstVal = await docTypeSel.evaluate(el => { const opts = (el as any).options as any[]; const found = Array.from(opts).find((o: any) => o.value !== ''); return found ? found.value : ''; }).catch(() => '');
        if (firstVal) await docTypeSel.selectOption(firstVal).catch(() => {});
      }
      await this.page.waitForTimeout(400);
    }
    if (data.idNumber)         await this.inp('idNumber', data.idNumber, 10_000);
    if (data.issuedDate)       await this.inp('issuedDate', data.issuedDate);
    if (data.expiryDate)       await this.inp('expiryDate', data.expiryDate);
    if (data.nameAsInDocument) await this.inp('nameAsInDocument', data.nameAsInDocument);
    if (data.recievedDate)     await this.inp('recievedDate', data.recievedDate);
    if (data.issuedByCountry)  await this.sel2('issuedByCountry', data.issuedByCountry);
    if (data.issuedBy)         await this.sel2('issuedBy', data.issuedBy);
    if (data.docUpload) { await this.page.locator('#docUpload, input[type="file"]').first().waitFor({ state: 'attached', timeout: 5_000 }).catch(() => {}); await this.page.locator('#docUpload, input[type="file"]').first().setInputFiles(data.docUpload); await this.page.waitForTimeout(400); }
    if (data.tdsAvailable === 'Y') await this.radio('TDSY');
    if (data.tdsAvailable === 'N') await this.radio('TDSN');
  }

  async fillPage3(data: CorporateCustomerData): Promise<void> {
    if (data.specialInstruct1) await this.inp('specialInstruct1', data.specialInstruct1);
    if (data.specialInstruct2) await this.inp('specialInstruct2', data.specialInstruct2);
    if (data.referBy)          await this.inp('referBy', data.referBy);
    if (data.lendingUnit)      await this.inp('lendingUnit', data.lendingUnit);
    if (data.operationCountry) await this.sel2('operationCountry', data.operationCountry);
  }

  async fillForm(data: CorporateCustomerData): Promise<void> {
    await this.fillPage1(data);
    await this.clickNext();
    await this.fillPage2(data);
    await this.clickNext();
    await this.fillPage3(data);
  }

  async save(): Promise<string> {
    await this.page.keyboard.press('Escape');
    await this.page.waitForTimeout(200);
    const saveBtn = this.page.locator('#saveCustomer, #btnSave, button.cnf-btn, button:has-text("Save")').first();
    await saveBtn.waitFor({ state: 'visible', timeout: 10_000 });
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click({ force: true });
    await this.page.waitForTimeout(500);
    const modalVisible = await this.page.locator('#tm-saveconfirm').isVisible().catch(() => false);
    if (modalVisible) { await this.page.locator('#submitForm').click(); await this.page.waitForTimeout(300); }
    const anyToast = this.page.locator('.toast-messages .msg-toast em').first();
    await anyToast.waitFor({ state: 'visible', timeout: 30_000 });
    const isSuccess = await this.page.locator('.toast-messages .msg-toast.msg-success em').first().isVisible().catch(() => false);
    const msg = (await anyToast.innerText()).trim();
    if (!isSuccess) throw new Error(`Save failed: "${msg}"`);
    await this.page.waitForURL(/corporateCustomerList/, { timeout: 15_000 }).catch(() => {});
    return msg;
  }

  async approve(customerId: string): Promise<string> {
    await this.switchToPendingTab();
    await this.searchPendingRecord(customerId);
    const row = this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: customerId }).first();
    await row.waitFor({ state: 'visible', timeout: 10_000 });
    await row.hover();
    await this.page.waitForTimeout(300);
    await row.locator('.authorization-btns a').first().click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.locator('button:has-text("Approve")').first().click();
    await this.page.waitForTimeout(300);
    await this.page.locator('#btnApproveId').click();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async switchToPendingTab(): Promise<void> {
    await this.page.waitForTimeout(1_000);
    const tab = this.page.locator('#PendingList, a[href="#PendingList"]').first();
    if (await tab.isVisible({ timeout: 5_000 }).catch(() => false)) await tab.click();
    await this.page.waitForTimeout(600);
  }

  async switchToAuthorizedTab(): Promise<void> { await this.page.locator('#AuthorizedList').click(); await this.page.waitForTimeout(500); }

  async searchPendingRecord(keyword: string): Promise<void> {
    const box = this.page.locator('#dt-pendingdata_filter input').first();
    if (await box.isVisible({ timeout: 3_000 }).catch(() => false)) { await box.fill(keyword); await this.page.waitForTimeout(800); }
  }

  async isRecordInPendingGrid(keyword: string): Promise<boolean> {
    return this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: keyword }).first().isVisible({ timeout: 8_000 }).catch(() => false);
  }

  async getCustomerIdFromGrid(name: string): Promise<string> {
    const row = this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: name }).first();
    return (await row.locator('td').nth(1).innerText().catch(() => '')).trim();
  }
}
