import { MakerCheckerWorkflow } from '../../../workflows/maker-checker/MakerCheckerWorkflow';
import { WorkflowContext } from '../../../workflows/base/BaseWorkflow';
import { RtgsNeftEntryPage, RtgsNeftEntryData } from '../pages/RtgsNeftEntryPage';
import { SharedDataStore } from '../../../framework/utils/SharedDataStore';

export class RtgsWorkflow extends MakerCheckerWorkflow {
  constructor(ctx: WorkflowContext, private readonly data: RtgsNeftEntryData) {
    super(ctx);
  }

  protected async makerAction(): Promise<string> {
    const page = new RtgsNeftEntryPage(this.makerPage);
    await page.goto();
    await page.openCreateForm();
    await page.fillForm(this.data);
    const toast = await page.save();
    SharedDataStore.set('rtgs_searchKey', this.data.searchKey ?? this.data.rtgsNeftAcctId ?? '');
    return toast;
  }

  protected async checkerAction(referenceId: string): Promise<string> {
    const page = new RtgsNeftEntryPage(this.checkerPage);
    await page.goto();
    return page.approve(referenceId);
  }

  protected async validateDb(referenceId: string): Promise<void> {
    if (!this.ctx.db) return;
    const { RtgsValidator } = await import('../validators/RtgsValidator');
    await new RtgsValidator(this.ctx.db).validateAuthorized(referenceId);
  }
}
