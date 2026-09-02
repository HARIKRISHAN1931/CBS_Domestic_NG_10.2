import { BaseWorkflow, WorkflowContext } from '../base/BaseWorkflow';

export interface TransactionResult {
  referenceId: string;
  amount:      number;
  status:      string;
  toast:       string;
}

/**
 * Base for financial transaction workflows (RTGS, NEFT, NACH, CASA transactions).
 * Enforces: entry → validate → submit → authorize pattern.
 */
export abstract class TransactionWorkflow extends BaseWorkflow {
  constructor(ctx: WorkflowContext) {
    super(ctx);
  }

  protected abstract enterTransaction(): Promise<string>;
  protected abstract validateTransaction(referenceId: string): Promise<void>;
  protected abstract authorizeTransaction(referenceId: string): Promise<string>;

  async execute(): Promise<TransactionResult> {
    this.log('Entering transaction');
    const referenceId = await this.enterTransaction();

    this.log(`Validating transaction: ${referenceId}`);
    await this.validateTransaction(referenceId);

    this.log(`Authorizing transaction: ${referenceId}`);
    const toast = await this.authorizeTransaction(referenceId);

    this.pass(`Transaction complete: ${referenceId}`);
    return { referenceId, amount: 0, status: 'authorized', toast };
  }
}
