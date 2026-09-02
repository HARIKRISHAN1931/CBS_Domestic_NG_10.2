import { BaseWorkflow, WorkflowContext } from '../base/BaseWorkflow';

export interface MakerCheckerResult {
  makerToast:   string;
  checkerToast: string;
  referenceId?: string;
}

/**
 * Orchestrates the full Maker → Checker authorization cycle.
 * Subclasses implement makerAction() and checkerAction().
 */
export abstract class MakerCheckerWorkflow extends BaseWorkflow {
  constructor(ctx: WorkflowContext) {
    super(ctx);
  }

  /**
   * Maker performs the transaction/creation and returns the reference ID.
   */
  protected abstract makerAction(): Promise<string>;

  /**
   * Checker authorizes the pending record identified by referenceId.
   */
  protected abstract checkerAction(referenceId: string): Promise<string>;

  /**
   * Optional DB validation after authorization.
   */
  protected async validateDb(_referenceId: string): Promise<void> {}

  async execute(): Promise<MakerCheckerResult> {
    this.log('Starting Maker action');
    const referenceId = await this.makerAction();
    this.pass(`Maker action complete. Reference: ${referenceId}`);

    this.log('Starting Checker action');
    const checkerToast = await this.checkerAction(referenceId);
    this.pass(`Checker action complete: ${checkerToast}`);

    await this.validateDb(referenceId);

    return { makerToast: referenceId, checkerToast, referenceId };
  }
}
