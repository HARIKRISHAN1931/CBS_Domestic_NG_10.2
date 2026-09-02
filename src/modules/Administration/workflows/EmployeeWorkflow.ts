import { MakerCheckerWorkflow } from '../../../workflows/maker-checker/MakerCheckerWorkflow';
import { WorkflowContext } from '../../../workflows/base/BaseWorkflow';
import { EmployeeMasterPage, EmployeeMasterData } from '../pages/EmployeeMasterPage';
import { SharedDataStore } from '../../../framework/utils/SharedDataStore';

export class EmployeeWorkflow extends MakerCheckerWorkflow {
  constructor(ctx: WorkflowContext, private readonly data: EmployeeMasterData) {
    super(ctx);
  }

  protected async makerAction(): Promise<string> {
    const page = new EmployeeMasterPage(this.makerPage);
    await page.goto();
    await page.openCreateForm();
    const toast = await page.create(this.data);
    SharedDataStore.set('admin_empId', this.data.empId ?? '');
    return toast;
  }

  protected async checkerAction(referenceId: string): Promise<string> {
    const page = new EmployeeMasterPage(this.checkerPage);
    await page.goto();
    await page.switchToPendingTab();
    return page.approve(referenceId);
  }
}
