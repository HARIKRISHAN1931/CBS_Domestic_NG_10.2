import { MakerCheckerWorkflow } from '../../../workflows/maker-checker/MakerCheckerWorkflow';
import { WorkflowContext } from '../../../workflows/base/BaseWorkflow';
import { TermDepositPage, TDContractData } from '../pages/TermDepositPage';
import { SharedDataStore } from '../../../framework/utils/SharedDataStore';

export { TDContractData as TdFormData };

export class TdWorkflow extends MakerCheckerWorkflow {
  constructor(ctx: WorkflowContext, private readonly data: TDContractData) {
    super(ctx);
  }

  protected async makerAction(): Promise<string> {
    const page = new TermDepositPage(this.makerPage);
    await page.goto();
    await page.openCreateForm();
    const toast = await page.create(this.data);
    SharedDataStore.set('td_customerCode', this.data.customerCode);
    return toast;
  }

  protected async checkerAction(referenceId: string): Promise<string> {
    const page = new TermDepositPage(this.checkerPage);
    await page.goto();
    await page.switchToPendingTab();
    return page.approve(referenceId);
  }

  protected async validateDb(referenceId: string): Promise<void> {
    if (!this.ctx.db) return;
    const { TdValidator } = await import('../validators/TdValidator');
    await new TdValidator(this.ctx.db).validateAuthorized(referenceId);
  }
}
