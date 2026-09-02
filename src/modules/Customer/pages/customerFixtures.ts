import { test as base } from '../../../framework/fixtures/fixtures';
import { CustomerListPage } from './CustomerListPage';
import { CustomerCreationPage } from './CustomerCreationPage';

export type CustomerFixtures = {
  customerListPage:     CustomerListPage;
  customerCreationPage: CustomerCreationPage;
};

export const test = base.extend<CustomerFixtures>({
  customerListPage: async ({ authenticatedPage }, use) => {
    const page = new CustomerListPage(authenticatedPage);
    await page.goto();
    await use(page);
  },

  customerCreationPage: async ({ authenticatedPage }, use) => {
    const page = new CustomerCreationPage(authenticatedPage);
    await page.goto();
    await page.openCreateForm();
    await use(page);
  },
});

export { expect } from '@playwright/test';
