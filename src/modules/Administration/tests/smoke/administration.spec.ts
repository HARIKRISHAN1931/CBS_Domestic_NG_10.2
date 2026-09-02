import { test, expect } from '../../../../framework/fixtures/fixtures';
import { EmployeeMasterPage, EmployeeMasterData } from '../../pages/EmployeeMasterPage';
import { UserMasterPage, UserMasterData } from '../../pages/UserMasterPage';
import { TestDataLoader } from '../../../../framework/utils/TestDataLoader';
import { ConfigManager } from '../../../../framework/config/ConfigManager';
import { SharedDataStore } from '../../../../framework/utils/SharedDataStore';

test.describe('Administration @smoke @admin', () => {
  let empData:  EmployeeMasterData;
  let userData: UserMasterData;

  test.beforeAll(() => {
    const file = ConfigManager.getTestDataPath('Administration.xlsx');
    empData  = TestDataLoader.load<EmployeeMasterData>(file, { operation: 'create', sheet: 'employee' })[0];
    userData = TestDataLoader.load<UserMasterData>(file,     { operation: 'create', sheet: 'user' })[0];
  });

  test('01 - Maker: Create Employee @create', async ({ makerContext }) => {
    const page = makerContext.pages().find(p => p.url().includes('secure-session'))
              ?? makerContext.pages()[makerContext.pages().length - 1];
    await page.bringToFront();

    const empPage = new EmployeeMasterPage(page);
    await empPage.goto();
    await empPage.openCreateForm();
    const toast = await empPage.create(empData);

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('admin_empId', empData.empId ?? '');
  });

  test('02 - Checker: Authorize Employee @authorize', async ({ checkerContext }) => {
    const page = checkerContext.pages().find(p => p.url().includes('secure-session'))
              ?? checkerContext.pages()[checkerContext.pages().length - 1];
    await page.bringToFront();

    const empPage = new EmployeeMasterPage(page);
    const empId   = SharedDataStore.get<string>('admin_empId') ?? empData.empId ?? '';

    await empPage.goto();
    await empPage.switchToPendingTab();
    const toast = await empPage.approve(empId);

    expect(toast).toMatch(/success|authoriz/i);
  });

  test('03 - Maker: Create User @create', async ({ makerContext }) => {
    const page = makerContext.pages().find(p => p.url().includes('secure-session'))
              ?? makerContext.pages()[makerContext.pages().length - 1];
    await page.bringToFront();

    const userPage = new UserMasterPage(page);
    await userPage.goto();
    await userPage.openCreateForm();
    const toast = await userPage.save();

    expect(toast).toMatch(/success|created/i);
    SharedDataStore.set('admin_loginId', userData.loginId ?? '');
  });

  test('04 - Checker: Authorize User @authorize', async ({ checkerContext }) => {
    const page = checkerContext.pages().find(p => p.url().includes('secure-session'))
              ?? checkerContext.pages()[checkerContext.pages().length - 1];
    await page.bringToFront();

    const userPage = new UserMasterPage(page);
    const loginId  = SharedDataStore.get<string>('admin_loginId') ?? userData.loginId ?? '';

    await userPage.goto();
    await userPage.switchToPendingTab();
    const toast = await userPage.approve(loginId);

    expect(toast).toMatch(/success|authoriz/i);
  });
});
