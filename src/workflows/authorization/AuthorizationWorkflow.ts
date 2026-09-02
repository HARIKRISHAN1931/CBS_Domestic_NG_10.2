import { BaseWorkflow, WorkflowContext } from '../base/BaseWorkflow';

export interface AuthorizationResult {
  status:      'authorized' | 'rejected';
  toast:       string;
  referenceId: string;
}

/**
 * Handles standalone authorization workflows where checker
 * independently authorizes or rejects pending records.
 */
export abstract class AuthorizationWorkflow extends BaseWorkflow {
  constructor(ctx: WorkflowContext) {
    super(ctx);
  }

  protected abstract navigateToPendingList(): Promise<void>;
  protected abstract selectRecord(referenceId: string): Promise<void>;
  protected abstract approve(): Promise<string>;
  protected abstract reject(remark: string): Promise<string>;

  async authorize(referenceId: string): Promise<AuthorizationResult> {
    this.log(`Authorizing record: ${referenceId}`);
    await this.navigateToPendingList();
    await this.selectRecord(referenceId);
    const toast = await this.approve();
    this.pass(`Authorized: ${referenceId}`);
    return { status: 'authorized', toast, referenceId };
  }

  async rejectRecord(referenceId: string, remark: string): Promise<AuthorizationResult> {
    this.log(`Rejecting record: ${referenceId}`);
    await this.navigateToPendingList();
    await this.selectRecord(referenceId);
    const toast = await this.reject(remark);
    this.pass(`Rejected: ${referenceId}`);
    return { status: 'rejected', toast, referenceId };
  }
}
