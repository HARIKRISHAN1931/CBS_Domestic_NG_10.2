import { test, expect } from '../../../../framework/fixtures/fixtures';
import { CustomerWorkflow } from '../../workflows/CustomerWorkflow';
import { CustomerValidator } from '../../validators/CustomerValidator';
import { CustomerDataGenerator } from '../../../../common/helpers/CustomerDataGenerator';

test.describe('Customer Creation - Retail @smoke @customer', () => {

  test('TC-001 Maker + Checker: Create and authorize retail customer', async ({
    makerContext, checkerContext, db,
  }) => {
    const data = CustomerDataGenerator.full();

    const makerPage   = makerContext.pages().find(p => p.url().includes('secure-session'))
                     ?? makerContext.pages()[makerContext.pages().length - 1];
    const checkerPage = checkerContext.pages().find(p => p.url().includes('secure-session'))
                     ?? checkerContext.pages()[checkerContext.pages().length - 1];

    const result = await new CustomerWorkflow({ makerPage, checkerPage, db }, data).execute();

    expect(result.checkerToast).toMatch(/success|authoriz/i);

    if (db.isConnected()) {
      await new CustomerValidator(db).validateAuthorized(result.referenceId ?? '');
    }
  });
});
