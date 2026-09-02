import { MakerCheckerWorkflow } from '../../../workflows/maker-checker/MakerCheckerWorkflow';
import { WorkflowContext } from '../../../workflows/base/BaseWorkflow';
import { LoanLimitPage, LoanLimitData } from '../pages/LoanLimitPage';
import { SharedDataStore } from '../../../framework/utils/SharedDataStore';

export class LoanWorkflow extends MakerCheckerWorkflow {
  constructor(ctx: WorkflowContext, private readonly data: LoanLimitData) {
    super(ctx);
  }

  protected async makerAction(): Promise<string> {
    const page = new LoanLimitPage(this.makerPage);
    await page.goto();
    await page.openCreateForm();
    const toast = await page.create(this.data);
    SharedDataStore.set('loan_customerCode', this.data.customerCode ?? '');
    return toast;
  }

  protected async checkerAction(referenceId: string): Promise<string> {
    const page = new LoanLimitPage(this.checkerPage);
    await page.goto();
    await page.switchToPendingTab();
    return page.authorizeRecord(referenceId);
  }
}
