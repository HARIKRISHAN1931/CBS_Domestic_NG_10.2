import { MakerCheckerWorkflow } from '../../../workflows/maker-checker/MakerCheckerWorkflow';
import { WorkflowContext } from '../../../workflows/base/BaseWorkflow';
import { RtgsNeftEntryPage, RtgsNeftEntryData } from '../../RTGS/pages/RtgsNeftEntryPage';
import { SharedDataStore } from '../../../framework/utils/SharedDataStore';

export class NeftWorkflow extends MakerCheckerWorkflow {
  constructor(ctx: WorkflowContext, private readonly data: RtgsNeftEntryData) {
    super(ctx);
  }

  protected async makerAction(): Promise<string> {
    const page = new RtgsNeftEntryPage(this.makerPage);
    await page.goto();
    await page.openCreateForm();
    await page.fillForm(this.data);
    const toast = await page.save();
    SharedDataStore.set('neft_searchKey', this.data.searchKey ?? this.data.rtgsNeftAcctId ?? '');
    return toast;
  }

  protected async checkerAction(referenceId: string): Promise<string> {
    const page = new RtgsNeftEntryPage(this.checkerPage);
    await page.goto();
    return page.approve(referenceId);
  }
}
