import { Page, Locator } from '@playwright/test';
import { CbsPage } from '../../../framework/base/CbsPage';

export interface TenantMasterData extends Record<string, unknown> {
  tenantId?:                    string;
  institutionName?:             string;
  address1?:                    string;
  address2?:                    string;
  address3?:                    string;
  country?:                     string;
  state?:                       string;
  city?:                        string;
  pinCode?:                     string;
  timeZone?:                    string;
  localDateFormat?:             string;
  localDateTimeFormat?:         string;
  tenantGroupId?:               string;
  tenantRegistrationDate?:      string;
  parent?:                      string;
  subsidiary?:                  string;
  logo?:                        string;
  icon?:                        string;
  tenantTheme?:                 string;
  tenantStatus?:                string;
  tenantDeregistrationDate?:    string;
  tenantDeregistrationReason?:  string;
  modules?:                     string;
  isSSOY?:                      string;
  isSSON?:                      string;
  isOTPY?:                      string;
  isOTPN?:                      string;
  otpType?:                     string;
  isBioMetricY?:                string;
  isBioMetricN?:                string;
}

export class TenantMasterPage extends CbsPage {
  protected readonly screenId = 'TENANTMST';

  constructor(page: Page) { super(page); }

  private v   = (id: string): Locator => this.page.locator(`#${id}`).first();
  private inp = async (id: string, val: string) => { await this.fill(this.v(id), val); };
  private sel = async (id: string, val: string) => { await this.selectOption(this.v(id), val); };
  private tab = async (id: string) => { await this.v(id).press('Tab'); };

  async openCreateForm(): Promise<void> {
    const addBtn = this.page.locator('#addButton');
    await addBtn.waitFor({ state: 'attached', timeout: 15_000 });
    await addBtn.click({ force: true });
    await this.waitForAjax();
    await this.page.locator('#tenantId').first().waitFor({ state: 'visible', timeout: 30_000 });
  }

  async fillForm(data: TenantMasterData): Promise<void> {
    await this.waitForAjax();
    if (data.tenantId                   !== undefined) { await this.inp('tenantId',                   data.tenantId!);                   await this.tab('tenantId'); }
    if (data.institutionName            !== undefined) { await this.inp('institutionName',            data.institutionName!);            await this.tab('institutionName'); }
    if (data.address1                   !== undefined) { await this.inp('address1',                   data.address1!);                   await this.tab('address1'); }
    if (data.address2                   !== undefined) { await this.inp('address2',                   data.address2!);                   await this.tab('address2'); }
    if (data.address3                   !== undefined) { await this.inp('address3',                   data.address3!);                   await this.tab('address3'); }
    if (data.country                    !== undefined) await this.sel('country',                      data.country!);
    if (data.state                      !== undefined) await this.sel('state',                        data.state!);
    if (data.city                       !== undefined) await this.sel('city',                         data.city!);
    if (data.pinCode                    !== undefined) { await this.inp('pinCode',                    data.pinCode!);                    await this.tab('pinCode'); }
    if (data.timeZone                   !== undefined) await this.sel('timeZone',                     data.timeZone!);
    if (data.localDateFormat            !== undefined) await this.sel('localDateFormat',              data.localDateFormat!);
    if (data.localDateTimeFormat        !== undefined) await this.sel('localDateTimeFormat',          data.localDateTimeFormat!);
    if (data.tenantGroupId              !== undefined) await this.sel('tenantGroupId',                data.tenantGroupId!);
    if (data.tenantRegistrationDate     !== undefined) { await this.inp('tenantRegistrationDate',     data.tenantRegistrationDate!);     await this.tab('tenantRegistrationDate'); }
    if (data.parent                     !== undefined) await this.sel('parent',                       data.parent!);
    if (data.subsidiary                 !== undefined) await this.sel('subsidiary',                   data.subsidiary!);
    if (data.logo                       !== undefined) { await this.inp('logo',                       data.logo!);                       await this.tab('logo'); }
    if (data.icon                       !== undefined) { await this.inp('icon',                       data.icon!);                       await this.tab('icon'); }
    if (data.tenantTheme                !== undefined) { await this.inp('tenantTheme',                data.tenantTheme!);                await this.tab('tenantTheme'); }
    if (data.tenantStatus               !== undefined) await this.sel('tenantStatus',                 data.tenantStatus!);
    if (data.tenantDeregistrationDate   !== undefined) { await this.inp('tenantDeregistrationDate',   data.tenantDeregistrationDate!);   await this.tab('tenantDeregistrationDate'); }
    if (data.tenantDeregistrationReason !== undefined) { await this.inp('tenantDeregistrationReason', data.tenantDeregistrationReason!); await this.tab('tenantDeregistrationReason'); }
    if (data.modules                    !== undefined) await this.sel('modules',                      data.modules!);
    if (data.isSSOY     !== undefined) await this.page.locator(`#${data.isSSOY}`).click().catch(() => {});
    if (data.isSSON     !== undefined) await this.page.locator(`#${data.isSSON}`).click().catch(() => {});
    if (data.isOTPY     !== undefined) await this.page.locator(`#${data.isOTPY}`).click().catch(() => {});
    if (data.isOTPN     !== undefined) await this.page.locator(`#${data.isOTPN}`).click().catch(() => {});
    if (data.otpType    !== undefined) await this.sel('otpType', data.otpType!);
    if (data.isBioMetricY !== undefined) await this.page.locator(`#${data.isBioMetricY}`).click().catch(() => {});
    if (data.isBioMetricN !== undefined) await this.page.locator(`#${data.isBioMetricN}`).click().catch(() => {});
  }

  async save(): Promise<string> {
    const btn = this.page.locator('#btnSave').first();
    await btn.waitFor({ state: 'visible', timeout: 15_000 });
    await btn.scrollIntoViewIfNeeded().catch(() => {});
    await btn.click({ force: true });
    await this.waitForAjax();
    const confirm = this.page.locator('#submitForm');
    if (await confirm.isVisible({ timeout: 5_000 }).catch(() => false)) { await confirm.click(); await this.waitForAjax(); }
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 20_000 });
    return (await toast.innerText()).trim();
  }

  async create(data: TenantMasterData): Promise<string> { await this.fillForm(data); return this.save(); }

  async approve(searchText: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first().locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.page.locator('#idApprove').click();
    await this.page.locator('#btnApproveId').click();
    await this.waitForAjax();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async reject(searchText: string, remark: string): Promise<string> {
    await this.page.locator('#dt-pendingdata tbody tr').filter({ hasText: searchText }).first().locator('.authorization-btns a').first().click();
    await this.waitForAjax();
    await this.page.locator('#idReject').click();
    await this.page.locator('#rejectRemark, #remarkId').first().fill(remark);
    await this.page.locator('#btnRejectId').click();
    await this.waitForAjax();
    const toast = this.page.locator('.toast-messages .msg-toast.msg-success em').first();
    await toast.waitFor({ state: 'visible', timeout: 15_000 });
    return (await toast.innerText()).trim();
  }

  async update(searchText: string, data: Partial<TenantMasterData>): Promise<string> {
    await this.page.locator('#searchInput, input[type="search"]').first().fill(searchText);
    await this.waitForAjax();
    await this.page.locator('a.btn-edit, .edit-btn, a[title="Edit"]').first().click();
    await this.waitForAjax();
    await this.fillForm(data as TenantMasterData);
    return this.save();
  }
}
