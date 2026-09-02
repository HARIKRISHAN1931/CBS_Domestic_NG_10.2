import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface CustomerData extends Record<string, unknown> {
  customerCategory:        string;
  customerType?:           string;
  customerBranch?:         string;
  AMLRating?:              string;
  memRole?:                string;
  nameTitle?:              string;
  memberFName:             string;
  memberMName?:            string;
  memberLName:             string;
  motherFname?:            string;
  motherMname?:            string;
  motherLname?:            string;
  spouseFname?:            string;
  spouseMname?:            string;
  spouseLname?:            string;
  memberDOB:               string;
  memberGender?:           string;
  nationality?:            string;
  mbrMaritalStatus?:       string;
  residentialStatus?:      string;
  residentYn?:             string;
  docProof?:               string;
  idType?:                 string;
  pan?:                    string;
  form60Yn?:               string;
  disabilityYn?:           string;
  memberMonthlyInc?:       string;
  addressType?:            string;
  address1?:               string;
  address2?:               string;
  address3?:               string;
  countryCode?:            string;
  stateCode?:              string;
  districtCode?:           string;
  area?:                   string;
  municipalityBlock?:      string;
  ruralUrban?:             string;
  villCode?:               string;
  urbanCode?:              string;
  pinCode?:                string;
  phone?:                  string;
  mobileNo1?:              string;
  emailId?:                string;
  homeTelNo?:              string;
  ownership?:              string;
  annualTurnover?:         string;
  KYCAvailableYn?:         string;
  NPARating?:              string;
  occupation?:             string;
  occupationType?:         string;
  pepYn?:                  string;
  kycExpiryDate?:          string;
  freezeType?:             string;
  frzReasonCd?:            string;
  freezeDate?:             string;
  religion?:               string;
  memberCaste?:            string;
  subCaste?:               string;
  bloodGroup?:             string;
  qualification?:          string;
  eddDesc?:                string;
  totalMaleChild?:         string;
  totalFemaleChild?:       string;
  totalFamilyMbr?:         string;
  relOff?:                 string;
  HNWCategory?:            string;
  memberTypeCode?:         string;
  memberDate?:             string;
  custReason?:             string;
  specialInstruct1?:       string;
  specialInstruct2?:       string;
  introducerCustNo?:       string;
  introducerConfirmedYn?:  string;
  proofType?:              string;
  docType?:                string;
  idNumber?:               string;
  issuedDate?:             string;
  expiryDate?:             string;
  nameAsInDocument?:       string;
  issuedByCountry?:        string;
  issuedBy?:               string;
  recievedDate?:           string;
  // second document (address proof)
  proofType2?:             string;
  docType2?:               string;
  idNumber2?:              string;
  issuedDate2?:            string;
  nameAsInDocument2?:      string;
  searchKey?:              string;
  tab?:                    string;
  tag?:                    string;
}

export class CustomerCreationPage extends CbsPage {
  protected readonly screenId = 'CUSTOMER';

  constructor(page: Page) { super(page); }

  private v  = (id: string): Locator => this.loc(`#${id}`);
  private async sel(id: string, val: string)  { if (val) await this.selectOption(this.v(id), val); await this.waitForAjax(); }
  private async inp(id: string, val: string)  { if (val) await this.fill(this.v(id), val); }
  private async radio(id: string)             { const el = this.v(id); await el.scrollIntoViewIfNeeded().catch(() => {}); if (await el.isEnabled().catch(() => false)) { await el.click(); await this.waitForAjax(); } }
  private async vis(id: string)               { return this.v(id).isVisible().catch(() => false); }

  private async sel2(id: string, value: string) {
    const container = this.loc(`#select2-${id}-container`).first();
    if (await container.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await container.click();
      const search = this.loc('.select2-search__field').last();
      if (await search.isVisible({ timeout: 1_000 }).catch(() => false)) await search.fill(value);
      const opt = this.loc('.select2-results__option').filter({ hasText: value }).first();
      if (await opt.isVisible({ timeout: 2_000 }).catch(() => false)) { await opt.click(); await this.waitForAjax(); return; }
      await this.page.keyboard.press('Escape');
    }
    await this.v(id).selectOption(value).catch(() => {});
    await this.waitForAjax();
  }

  private async clickNext(anchorId?: string): Promise<void> {
    await this.switchToActivePage();
    const btn = this.loc('#nextBtn');
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    await this.page.waitForTimeout(1_500);
    await this.switchToActivePage();
    if (anchorId) await this.loc(`#${anchorId}`).waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
    await this.waitForAjax();
  }

  async openCreateForm(): Promise<void> {
    await this.page.waitForTimeout(1_500);
    const addBtn = this.page.locator('#addButton, button.add, #createButton, a[onclick*="add"], button[title*="Add"]').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await addBtn.click({ force: true });
    await this.page.locator('#customerCategory').waitFor({ state: 'visible', timeout: 30_000 });
    await this.waitForAjax();
  }

  async fillBasicDetails(data: CustomerData): Promise<void> {
    await this.v('customerCategory').waitFor({ state: 'visible', timeout: 15_000 });
    if (data.customerBranch && await this.vis('customerBranch')) await this.sel('customerBranch', data.customerBranch);
    if (data.customerType   && await this.vis('customerType'))   await this.sel('customerType',   data.customerType);
    await this.sel('customerCategory', data.customerCategory);
    if (data.AMLRating && await this.vis('AMLRating')) await this.sel('AMLRating', data.AMLRating);
    if (data.memRole   && await this.vis('memRole'))   await this.sel('memRole',   data.memRole);
    if (data.nameTitle && await this.vis('nameTitle')) await this.sel('nameTitle', data.nameTitle);
    await this.inp('memberFName', data.memberFName);
    if (data.memberMName && await this.vis('memberMName')) await this.inp('memberMName', data.memberMName);
    await this.inp('memberLName', data.memberLName);
    if (data.motherFname && await this.vis('motherFname')) await this.inp('motherFname', data.motherFname);
    if (data.motherMname && await this.vis('motherMname')) await this.inp('motherMname', data.motherMname);
    if (data.motherLname && await this.vis('motherLname')) await this.inp('motherLname', data.motherLname);
    if (data.spouseFname && await this.vis('spouseFname')) await this.inp('spouseFname', data.spouseFname);
    if (data.spouseMname && await this.vis('spouseMname')) await this.inp('spouseMname', data.spouseMname);
    if (data.spouseLname && await this.vis('spouseLname')) await this.inp('spouseLname', data.spouseLname);
    await this.inp('memberDOB', data.memberDOB);
    await this.v('memberDOB').press('Tab');
    await this.waitForAjax();
    if (data.memberGender && await this.vis('memberGender')) {
      for (let i = 0; i < 10; i++) {
        if (await this.v('memberGender').isEnabled().catch(() => false)) break;
        await this.page.waitForTimeout(500);
      }
      await this.sel('memberGender', data.memberGender);
    }
    if (data.nationality       && await this.vis('nationality'))       await this.sel2('nationality',      data.nationality);
    if (data.mbrMaritalStatus  && await this.vis('mbrMaritalStatus'))  await this.sel('mbrMaritalStatus',  data.mbrMaritalStatus);
    if (data.residentialStatus && await this.vis('residentialStatus')) await this.sel('residentialStatus', data.residentialStatus);
    if (data.residentYn)   { const rid = data.residentYn   === 'Y' ? 'residentY'   : 'residentN';   if (await this.vis(rid)) await this.radio(rid); }
    if (data.docProof && await this.vis('docProof')) { await this.sel('docProof', data.docProof); await this.waitForAjax(); }
    if (data.idType   && await this.vis('idType'))   await this.inp('idType', data.idType);
    if (data.pan      && await this.vis('pan'))      await this.inp('pan',    data.pan);
    if (data.form60Yn)    { const rid = data.form60Yn    === 'Y' ? 'form60Y'    : 'form60N';    if (await this.vis(rid)) await this.radio(rid); }
    if (data.disabilityYn){ const rid = data.disabilityYn === 'Y' ? 'disabilityY': 'disabilityN'; if (await this.vis(rid)) await this.radio(rid); }
    if (data.memberMonthlyInc && await this.vis('memberMonthlyInc')) await this.inp('memberMonthlyInc', data.memberMonthlyInc);
  }

  async fillContactDetails(data: CustomerData): Promise<void> {
    await this.clickNext('addressType');
    if (!await this.vis('address1')) {
      const expand = this.loc('#btnExpanBusinComm').first();
      if (await expand.isVisible({ timeout: 3_000 }).catch(() => false)) { await expand.scrollIntoViewIfNeeded(); await expand.click(); await this.waitForAjax(); }
    }
    await this.loc('#addressType, #address1').first().waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    if (data.address1    && await this.vis('address1'))    await this.inp('address1',    data.address1);
    if (data.address2    && await this.vis('address2'))    await this.inp('address2',    data.address2);
    if (data.address3    && await this.vis('address3'))    await this.inp('address3',    data.address3);
    if (data.countryCode  && await this.vis('countryCode'))  { await this.sel('countryCode',  data.countryCode);  await this.waitForAjax(); }
    if (data.stateCode    && await this.vis('stateCode'))    { await this.sel('stateCode',    data.stateCode);    await this.waitForAjax(); }
    if (data.districtCode && await this.vis('districtCode')) { await this.sel('districtCode', data.districtCode); await this.waitForAjax(); }
    if (data.area         && await this.vis('area'))         { await this.sel('area',         data.area);         await this.waitForAjax(); }
    if (data.ruralUrban   && await this.vis('ruralUrban'))   { await this.sel('ruralUrban', data.ruralUrban); await this.waitForAjax(); }
    if (data.municipalityBlock && await this.vis('municipalityBlock')) { await this.sel('municipalityBlock', data.municipalityBlock); await this.waitForAjax(); }
    if (data.villCode  && await this.loc('#select2-villCode-container').isVisible({ timeout: 1_500 }).catch(() => false))  await this.sel2('villCode',  data.villCode);
    if (data.urbanCode && await this.loc('#select2-urbanCode-container').isVisible({ timeout: 1_500 }).catch(() => false)) await this.sel2('urbanCode', data.urbanCode);
    if (data.pinCode && await this.vis('pinCode')) { await this.inp('pinCode', data.pinCode); await this.v('pinCode').press('Tab'); await this.waitForAjax(); }
    if (data.addressType && await this.vis('addressType')) await this.sel('addressType', data.addressType);
    if (data.phone     && await this.vis('phone'))     await this.inp('phone',     data.phone);
    if (data.mobileNo1 && await this.vis('mobileNo1')) await this.inp('mobileNo1', data.mobileNo1);
    if (data.emailId   && await this.vis('emailId'))   await this.inp('emailId',   data.emailId);
    if (data.homeTelNo && await this.vis('homeTelNo')) await this.inp('homeTelNo', data.homeTelNo);
    if (data.ownership && await this.vis('ownership')) await this.sel('ownership', data.ownership);
    const addBtn = this.v('btnAddBusiComm');
    if (await addBtn.isVisible({ timeout: 5_000 }).catch(() => false)) { await addBtn.click({ force: true }); await this.waitForAjax(); await this.switchToActivePage(); }
  }

  async fillAdditionalDetails(data: CustomerData): Promise<void> {
    await this.switchToActivePage();
    await this.clickNext('KYCAvailableY');
    if (data.KYCAvailableYn) { const rid = data.KYCAvailableYn === 'Y' ? 'KYCAvailableY' : 'KYCAvailableN'; if (await this.vis(rid)) await this.radio(rid); }
    if (data.pepYn)          { const rid = data.pepYn          === 'Y' ? 'pepY'          : 'pepN';          if (await this.vis(rid)) await this.radio(rid); }
    if (data.kycExpiryDate && await this.vis('kycExpiryDate')) await this.inp('kycExpiryDate', data.kycExpiryDate);
    if (data.freezeType    && await this.vis('freezeType'))    await this.sel('freezeType',    data.freezeType);
    if (data.frzReasonCd   && await this.vis('frzReasonCd'))   await this.sel('frzReasonCd',   data.frzReasonCd);
    if (data.freezeDate    && await this.vis('freezeDate'))    await this.inp('freezeDate',    data.freezeDate);
    if (data.annualTurnover && await this.vis('annualTurnover')) await this.sel('annualTurnover', data.annualTurnover);
    if (data.NPARating      && await this.vis('NPARating'))      await this.sel('NPARating',      data.NPARating);
    if (data.occupation     && await this.vis('occupation'))     { await this.sel('occupation', data.occupation); await this.waitForAjax(); }
    if (data.occupationType && await this.vis('occupationType')) await this.sel('occupationType', data.occupationType);
    if (data.religion       && await this.vis('religion'))       await this.sel('religion',       data.religion);
    if (data.memberCaste    && await this.vis('memberCaste'))    await this.sel('memberCaste',    data.memberCaste);
    if (data.subCaste       && await this.vis('subCaste'))       await this.sel('subCaste',       data.subCaste);
    if (data.bloodGroup     && await this.vis('bloodGroup'))     await this.sel('bloodGroup',     data.bloodGroup);
    if (data.qualification  && await this.vis('qualification'))  await this.sel('qualification',  data.qualification);
    if (data.eddDesc        && await this.vis('eddDesc'))        await this.inp('eddDesc',        data.eddDesc);
    if (data.totalMaleChild   && await this.vis('totalMaleChild'))   await this.inp('totalMaleChild',   data.totalMaleChild);
    if (data.totalFemaleChild && await this.vis('totalFemaleChild')) await this.inp('totalFemaleChild', data.totalFemaleChild);
    if (data.totalFamilyMbr   && await this.vis('totalFamilyMbr'))   await this.inp('totalFamilyMbr',   data.totalFamilyMbr);
    if (data.relOff         && await this.vis('relOff'))         await this.sel('relOff',         data.relOff);
    if (data.HNWCategory    && await this.vis('HNWCategory'))    await this.sel('HNWCategory',    data.HNWCategory);
    if (data.memberTypeCode && await this.vis('memberTypeCode')) await this.sel('memberTypeCode', data.memberTypeCode);
    if (data.memberDate     && await this.vis('memberDate'))     await this.inp('memberDate',     data.memberDate);
    if (data.custReason     && await this.vis('custReason'))     await this.sel('custReason',     data.custReason);
    if (data.specialInstruct1 && await this.vis('specialInstruct1')) await this.inp('specialInstruct1', data.specialInstruct1);
    if (data.specialInstruct2 && await this.vis('specialInstruct2')) await this.inp('specialInstruct2', data.specialInstruct2);
    if (data.introducerCustNo && await this.vis('introducerCustNo')) { await this.inp('introducerCustNo', data.introducerCustNo); await this.v('introducerCustNo').press('Tab'); await this.waitForAjax(); }
    if (data.introducerConfirmedYn) { const rid = data.introducerConfirmedYn === 'Y' ? 'introducerConfirmedY' : 'introducerConfirmedN'; if (await this.vis(rid)) await this.radio(rid); }
  }

  async fillDocumentDetails(data: CustomerData): Promise<void> {
    await this.clickNext();
    await this.waitForAjax();
    await this.page.waitForTimeout(1_000);

    // Identity proof (mandatory)
    await this.v('proofType').waitFor({ state: 'visible', timeout: 10_000 }).catch(() => {});
    if (!await this.vis('proofType')) return;

    await this.sel('proofType', data.proofType || '2');
    await this.waitForAjax();
    if (data.docType && await this.vis('docType') && await this.v('docType').isEnabled().catch(() => false))
      await this.sel('docType', data.docType);
    if (data.idNumber         && await this.vis('idNumber'))         await this.inp('idNumber',         data.idNumber);
    if (data.issuedDate       && await this.vis('issuedDate'))       await this.inp('issuedDate',       data.issuedDate);
    if (data.expiryDate       && await this.vis('expiryDate'))       await this.inp('expiryDate',       data.expiryDate);
    if (data.nameAsInDocument && await this.vis('nameAsInDocument')) await this.inp('nameAsInDocument', data.nameAsInDocument);
    if (data.issuedBy         && await this.vis('issuedBy'))         await this.sel('issuedBy',         data.issuedBy);
    await this.sel('issuedByCountry', data.issuedByCountry || '1').catch(() => {});

    const addDocBtn = this.loc('#btnAdd').first();
    if (await addDocBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await addDocBtn.scrollIntoViewIfNeeded();
      await addDocBtn.click();
      await this.waitForAjax();
      await this.page.waitForTimeout(500);
    }

    // Address proof (optional second doc — only if proofType2 provided)
    if (data.proofType2) {
      await this.v('proofType').waitFor({ state: 'visible', timeout: 5_000 }).catch(() => {});
      if (!await this.vis('proofType')) return;
      await this.sel('proofType', data.proofType2);
      await this.waitForAjax();
      if (data.docType2 && await this.vis('docType') && await this.v('docType').isEnabled().catch(() => false))
        await this.sel('docType', data.docType2);
      if (data.idNumber2         && await this.vis('idNumber'))         await this.inp('idNumber',         data.idNumber2);
      if (data.issuedDate2       && await this.vis('issuedDate'))       await this.inp('issuedDate',       data.issuedDate2);
      if (data.nameAsInDocument2 && await this.vis('nameAsInDocument')) await this.inp('nameAsInDocument', data.nameAsInDocument2);
      await this.sel('issuedByCountry', data.issuedByCountry || '1').catch(() => {});
      if (await addDocBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await addDocBtn.scrollIntoViewIfNeeded();
        await addDocBtn.click();
        await this.waitForAjax();
      }
    }
  }

  async save(): Promise<string> {
    const btn = this.page.locator('#saveMemberDetails, #saveCustomerDetails, #saveDepositeparamDetails, button[id*="save"], input[id*="save"]').filter({ visible: true }).first();
    await btn.waitFor({ state: 'visible', timeout: 10_000 });
    await btn.click();
    await this.modal.confirmSave();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`[CBS] ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }

  async approve(searchKey: string, tab = 'pending'): Promise<string> {
    await this.grid.switchTab(tab as any);
    await this.grid.clickAuthorize(searchKey);
    await this.modal.confirmApprove();
    await this.switchToActivePage();
    const errToast = this.page.locator('.toast-messages .msg-toast.msg-error em').first();
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`CBS approve error: ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }
}
