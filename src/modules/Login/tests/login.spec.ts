import { test, expect } from '@playwright/test';
import { config } from '../../../framework/config/config';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login @smoke @login', () => {
  test('01 - valid credentials should login successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(config.auth.username, config.auth.password);

    // CBS redirects to dashboard/home after login — URL changes away from LoginPage
    await expect(page).not.toHaveURL(/LoginPage/i, { timeout: 15_000 });
    await expect(page.locator('body')).not.toContainText(/invalid|incorrect|failed/i);
  });

  test('02 - wrong password should show error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(config.auth.username, 'WrongPass@999');

    await loginPage.expectInvalidCredentialsError();
  });

  test('03 - wrong username should not login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('INVALID_USER', config.auth.password);

    // App stays on login page — either shows error or silently rejects
    await page.waitForTimeout(3_000);
    await expect(page).toHaveURL(/LoginPage/i);
  });

  test('04 - password field should be masked', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  });

  test('05 - empty submit should not navigate away from login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginButton.click();

    await expect(page).toHaveURL(/LoginPage/i);
  });
});
