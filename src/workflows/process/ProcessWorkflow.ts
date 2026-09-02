import { BaseWorkflow, WorkflowContext } from '../base/BaseWorkflow';

export interface ProcessResult {
  processType: string;
  status:      'completed' | 'failed';
  startTime:   Date;
  endTime:     Date;
  duration:    number;
}

/**
 * Base for EOD/BOD and batch process automation workflows.
 */
export abstract class ProcessWorkflow extends BaseWorkflow {
  constructor(ctx: WorkflowContext) {
    super(ctx);
  }

  protected abstract navigateToProcess(): Promise<void>;
  protected abstract initiateProcess(): Promise<void>;
  protected abstract waitForCompletion(): Promise<void>;
  protected abstract verifyCompletion(): Promise<boolean>;

  async execute(processType: string): Promise<ProcessResult> {
    const startTime = new Date();
    this.log(`Starting process: ${processType}`);

    await this.navigateToProcess();
    await this.initiateProcess();
    await this.waitForCompletion();
    const success = await this.verifyCompletion();

    const endTime  = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    if (success) {
      this.pass(`Process ${processType} completed in ${duration}ms`);
    } else {
      this.fail(`Process ${processType} failed after ${duration}ms`);
    }

    return {
      processType,
      status:    success ? 'completed' : 'failed',
      startTime,
      endTime,
      duration,
    };
  }
}
