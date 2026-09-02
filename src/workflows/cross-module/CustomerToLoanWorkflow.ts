import { BaseWorkflow, WorkflowContext } from '../base/BaseWorkflow';
import { CustomerWorkflow } from '../../modules/Customer/workflows/CustomerWorkflow';
import { LoanWorkflow } from '../../modules/Loans/workflows/LoanWorkflow';
import { CustomerData } from '../../modules/Customer/pages/CustomerCreationPage';
import { LoanLimitData } from '../../modules/Loans/pages/LoanLimitPage';
import { SharedDataStore } from '../../framework/utils/SharedDataStore';

export interface CustomerToLoanInput {
  customer: CustomerData;
  loan:     Omit<LoanLimitData, 'customerCode'>;
}

export class CustomerToLoanWorkflow extends BaseWorkflow {
  constructor(ctx: WorkflowContext, private readonly input: CustomerToLoanInput) {
    super(ctx);
  }

  async execute(): Promise<{ customerToast: string; loanToast: string }> {
    this.log('Step 1 — Customer creation (maker + checker)');
    const custResult = await new CustomerWorkflow(this.ctx, this.input.customer).execute();
    this.pass(`Customer done: ${custResult.referenceId}`);

    const customerCode = SharedDataStore.get<string>('lastCustomerName') ?? custResult.referenceId ?? '';

    this.log('Step 2 — Loan Limit (maker + checker)');
    const loanData: LoanLimitData = { ...this.input.loan, customerCode };
    const loanResult = await new LoanWorkflow(this.ctx, loanData).execute();
    this.pass(`Loan done: ${loanResult.checkerToast}`);

    return { customerToast: custResult.checkerToast, loanToast: loanResult.checkerToast };
  }
}
