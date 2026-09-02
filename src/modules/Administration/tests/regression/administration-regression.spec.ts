import { test, expect } from '../../../../framework/fixtures/fixtures';
import { EmployeeMasterPage, EmployeeMasterData } from '../../pages/EmployeeMasterPage';
import { UserMasterPage, UserMasterData } from '../../pages/UserMasterPage';
import { AdministrationValidator } from '../../validators/AdministrationValidator';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

const getPage = (ctx: import('@playwright/test').BrowserContext) =>
  ctx.pages().find(p => p.url().includes('secure-session')) ?? ctx.pages()[ctx.pages().length - 1];

test.describe('Administration Regression @regression @admin', () => {
  let empData:  EmployeeMasterData;
  let userData: UserMasterData;

  test.beforeAll(() => {
    const file = ConfigManager.getTestDataPath('Administration.xlsx');
    empData  = TestDataLoader.load<EmployeeMasterData>(file, { operation: 'create', sheet: 'employee' })[0];
    userData = TestDataLoader.load<UserMasterData>(file,     { operation: 'create', sheet: 'user' })[0];
  });

  test('01 - Maker: Create Employee', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const empPage = new EmployeeMasterPage(page);
    await empPage.goto();
    await empPage.openCreateForm();
    const toast = await empPage.create(empData);
    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('reg_empId', empData.empId ?? '');
  });

  test('02 - Verify: Employee in pending grid', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const empPage = new EmployeeMasterPage(page);
    await empPage.goto();
    await empPage.switchToPendingTab();
    const empId = SharedDataStore.getOrThrow<string>('reg_empId');
    const inGrid = await empPage.isRecordInPendingGrid(empId);
    expect(inGrid).toBe(true);
  });

  test('03 - Checker: Authorize Employee', async ({ checkerContext, db }) => {
    const page = getPage(checkerContext);
    await page.bringToFront();
    const empPage = new EmployeeMasterPage(page);
    const empId = SharedDataStore.getOrThrow<string>('reg_empId');
    await empPage.goto();
    await empPage.switchToPendingTab();
    const toast = await empPage.approve(empId);
    expect(toast).toMatch(/success|authoriz/i);
    if (db.isConnected()) {
      await new AdministrationValidator(db).validateEmployeeAuthorized(empId);
    }
  });

  test('04 - Verify: Employee in authorized grid', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const empPage = new EmployeeMasterPage(page);
    await empPage.goto();
    const empId = SharedDataStore.getOrThrow<string>('reg_empId');
    const inGrid = await empPage.isRecordInAuthorizedGrid(empId);
    expect(inGrid).toBe(true);
  });

  test('05 - Maker: Create User', async ({ makerContext }) => {
    const page = getPage(makerContext);
    await page.bringToFront();
    const userPage = new UserMasterPage(page);
    await userPage.goto();
    await userPage.openCreateForm();
    await userPage.fillForm(userData);
    const toast = await userPage.save();
    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('reg_loginId', userData.loginId ?? '');
  });

  test('06 - Checker: Authorize User', async ({ checkerContext, db }) => {
    const page = getPage(checkerContext);
    await page.bringToFront();
    const userPage = new UserMasterPage(page);
    const loginId = SharedDataStore.getOrThrow<string>('reg_loginId');
    await userPage.goto();
    await userPage.switchToPendingTab();
    const toast = await userPage.approve(loginId);
    expect(toast).toMatch(/success|authoriz/i);
    if (db.isConnected()) {
      await new AdministrationValidator(db).validateUserAuthorized(loginId);
    }
  });
});
