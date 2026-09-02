import { MakerCheckerWorkflow } from '../../../workflows/maker-checker/MakerCheckerWorkflow';
import { WorkflowContext } from '../../../workflows/base/BaseWorkflow';
import { CustomerCreationPage, CustomerData } from '../pages/CustomerCreationPage';
import { SharedDataStore } from '../../../framework/utils/SharedDataStore';

export class CustomerWorkflow extends MakerCheckerWorkflow {
  constructor(ctx: WorkflowContext, private readonly data: CustomerData) {
    super(ctx);
  }

  protected async makerAction(): Promise<string> {
    const page = new CustomerCreationPage(this.makerPage);
    await page.goto();
    await page.openCreateForm();
    await page.fillBasicDetails(this.data);
    await page.fillContactDetails(this.data);
    await page.fillAdditionalDetails(this.data);
    await page.fillDocumentDetails(this.data);
    const toast = await page.save();
    SharedDataStore.set('lastCustomerName', `${this.data.memberFName} ${this.data.memberLName}`);
    return toast;
  }

  protected async checkerAction(referenceId: string): Promise<string> {
    const page = new CustomerCreationPage(this.checkerPage);
    await page.goto();
    return page.approve(referenceId);
  }

  protected async validateDb(referenceId: string): Promise<void> {
    if (!this.ctx.db) return;
    const { CustomerValidator } = await import('../validators/CustomerValidator');
    const validator = new CustomerValidator(this.ctx.db);
    await validator.validateAuthorized(referenceId);
  }
}
