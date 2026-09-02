import { MakerCheckerWorkflow } from '../../../workflows/maker-checker/MakerCheckerWorkflow';
import { WorkflowContext } from '../../../workflows/base/BaseWorkflow';
import { AccountOpeningPage, AccountOpeningFormData } from '../pages/AccountOpeningPage';
import { SharedDataStore } from '../../../framework/utils/SharedDataStore';

export class CasaWorkflow extends MakerCheckerWorkflow {
  constructor(ctx: WorkflowContext, private readonly data: AccountOpeningFormData) {
    super(ctx);
  }

  protected async makerAction(): Promise<string> {
    const page = new AccountOpeningPage(this.makerPage);
    await page.goto();
    await page.openCreateForm();
    const toast = await page.create(this.data);
    SharedDataStore.set('casa_customerNumber', this.data.customerNumber);
    return toast;
  }

  protected async checkerAction(referenceId: string): Promise<string> {
    const page = new AccountOpeningPage(this.checkerPage);
    await page.goto();
    await page.switchToPendingTab();
    return page.approve(referenceId);
  }

  protected async validateDb(referenceId: string): Promise<void> {
    if (!this.ctx.db) return;
    const { CasaValidator } = await import('../validators/CasaValidator');
    const validator = new CasaValidator(this.ctx.db);
    await validator.validateAuthorized(referenceId);
  }
}
