import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface RtgsNeftEntryData extends Record<string, unknown> {
  msgTrfType?:       string;
  msgSType?:         string;
  msgDate?:          string;
  rtgsNeftAcctId?:   string;
  tBatchCd?:         string;
  ordIFSCCd?:        string;
  orgBrCode?:        string;
  ordAcctId?:        string;
  ordDesc1?:         string;
  ordDesc2?:         string;
  ordDesc3?:         string;
  ordDesc4?:         string;
  ordDesc5?:         string;
  mobileEmail?:      string;
  mobileNo?:         string;
  email?:            string;
  insType?:          string;
  chequeNo?:         string;
  instrDate?:        string;
  insDate?:          string;
  valueAmt_txt?:     string;
  cusLeiNo?:         string;
  benLeiNo?:         string;
  organisationCode?: string;
  dtlsOfChrgs?:      string;
  msgPriority?:      string;
  exisBenDesc?:      string;
  benIFSCCd?:        string;
  benaccountVer?:    string;
  benDesc1?:         string;
  benDesc2?:         string;
  benDesc3?:         string;
  benDesc4?:         string;
  benDesc5?:         string;
  fldNo?:            string;
  fld1?:             string;
  fld2?:             string;
  fld3?:             string;
  fld4?:             string;
  fld5?:             string;
  searchKey?:        string;
  tab?:              string;
}

export class RtgsNeftEntryPage extends CbsPage {
  protected readonly screenId = 'TRANSACTIONMST';

  constructor(page: Page) { super(page); }

  private v  = (id: string): Locator => this.loc(`#${id}`);
  private async inp(id: string, val: string)  { if (val) await this.fill(this.v(id), val); }
  private async sel(id: string, val: string)  { if (val) await this.selectOption(this.v(id), val); await this.waitForAjax(); }
  private async vis(id: string): Promise<boolean> { return this.v(id).isVisible().catch(() => false); }

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton, .add-btn, #createButton, a[onclick*="add"]').first();
    await addBtn.waitFor({ state: 'visible', timeout: 15_000 });
    await addBtn.click();
    await this.v('msgTrfType').waitFor({ state: 'visible', timeout: 20_000 });
    await this.waitForAjax();
  }

  async fillForm(data: RtgsNeftEntryData): Promise<void> {
    if (data.msgTrfType)  await this.sel('msgTrfType', data.msgTrfType);
    if (data.msgSType)    await this.sel('msgSType',   data.msgSType);
    if (data.msgDate)     await this.inp('msgDate',    data.msgDate);
    if (data.rtgsNeftAcctId) await this.inp('rtgsNeftAcctId', data.rtgsNeftAcctId);
    if (data.tBatchCd)    await this.sel('tBatchCd',   data.tBatchCd);
    if (data.ordIFSCCd)   { await this.inp('ordIFSCCd', data.ordIFSCCd); await this.v('ordIFSCCd').press('Tab'); await this.waitForAjax(); }
    if (data.orgBrCode)   await this.sel('orgBrCode',  data.orgBrCode);
    if (data.ordAcctId)   await this.inp('ordAcctId',  data.ordAcctId);
    if (data.ordDesc1)    await this.inp('ordDesc1',   data.ordDesc1);
    if (data.ordDesc2)    await this.inp('ordDesc2',   data.ordDesc2);
    if (data.ordDesc3)    await this.inp('ordDesc3',   data.ordDesc3);
    if (data.ordDesc4)    await this.inp('ordDesc4',   data.ordDesc4);
    if (data.ordDesc5)    await this.inp('ordDesc5',   data.ordDesc5);
    if (data.mobileEmail) await this.sel('mobileEmail', data.mobileEmail);
    if (data.mobileNo && await this.vis('mobileNo')) await this.inp('mobileNo', data.mobileNo);
    if (data.email    && await this.vis('email'))    await this.inp('email',    data.email);
    if (data.insType)     await this.sel('insType',    data.insType);
    if (data.chequeNo)    await this.inp('chequeNo',   data.chequeNo);
    if (data.instrDate)   await this.inp('instrDate',  data.instrDate);
    if (data.insDate)     await this.inp('insDate',    data.insDate);
    if (data.valueAmt_txt) { await this.inp('valueAmt_txt', data.valueAmt_txt); await this.v('valueAmt_txt').press('Tab'); await this.waitForAjax(); }
    if (data.cusLeiNo)         await this.inp('cusLeiNo',         data.cusLeiNo);
    if (data.benLeiNo)         await this.inp('benLeiNo',         data.benLeiNo);
    if (data.organisationCode) await this.inp('organisationCode', data.organisationCode);
    if (data.dtlsOfChrgs)      await this.sel('dtlsOfChrgs', data.dtlsOfChrgs);
    if (data.msgPriority)      await this.sel('msgPriority', data.msgPriority);
    if (data.benIFSCCd)   { await this.inp('benIFSCCd', data.benIFSCCd); await this.v('benIFSCCd').press('Tab'); await this.waitForAjax(); }
    if (data.exisBenDesc)   await this.inp('exisBenDesc',   data.exisBenDesc);
    if (data.benaccountVer) await this.inp('benaccountVer', data.benaccountVer);
    if (data.benDesc1)      await this.inp('benDesc1',      data.benDesc1);
    if (data.benDesc2)      await this.inp('benDesc2',      data.benDesc2);
    if (data.benDesc3)      await this.inp('benDesc3',      data.benDesc3);
    if (data.benDesc4)      await this.inp('benDesc4',      data.benDesc4);
    if (data.benDesc5)      await this.inp('benDesc5',      data.benDesc5);
    if (data.fldNo) await this.sel('fldNo', data.fldNo);
    if (data.fld1)  await this.inp('fld1',  data.fld1);
    if (data.fld2)  await this.inp('fld2',  data.fld2);
    if (data.fld3)  await this.inp('fld3',  data.fld3);
    if (data.fld4)  await this.inp('fld4',  data.fld4);
    if (data.fld5)  await this.inp('fld5',  data.fld5);
  }

  async save(): Promise<string> {
    const btn = this.page.locator('#saveD946020, #saveRtgsNeft, #saveDepositeparamDetails, button[id*="save"]').filter({ visible: true }).first();
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
    if (await errToast.isVisible({ timeout: 5_000 }).catch(() => false)) throw new Error(`[CBS] ${(await errToast.innerText().catch(() => '')).trim()}`);
    return this.toast.getSuccess();
  }
}
