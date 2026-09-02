import { BaseWorkflow, WorkflowContext } from '../base/BaseWorkflow';
import { CustomerWorkflow } from '../../modules/Customer/workflows/CustomerWorkflow';
import { CasaWorkflow } from '../../modules/CASA/workflows/CasaWorkflow';
import { CustomerData } from '../../modules/Customer/pages/CustomerCreationPage';
import { AccountOpeningFormData } from '../../modules/CASA/pages/AccountOpeningPage';
import { SharedDataStore } from '../../framework/utils/SharedDataStore';

export interface CustomerToCasaInput {
  customer: CustomerData;
  casa:     Omit<AccountOpeningFormData, 'customerNumber'>;
}

export class CustomerToCasaWorkflow extends BaseWorkflow {
  constructor(ctx: WorkflowContext, private readonly input: CustomerToCasaInput) {
    super(ctx);
  }

  async execute(): Promise<{ customerToast: string; casaToast: string }> {
    this.log('Step 1 — Customer creation (maker + checker)');
    const custResult = await new CustomerWorkflow(this.ctx, this.input.customer).execute();
    this.pass(`Customer done: ${custResult.referenceId}`);

    const customerNumber = SharedDataStore.get<string>('lastCustomerName') ?? custResult.referenceId ?? '';

    this.log('Step 2 — CASA account opening (maker + checker)');
    const casaData: AccountOpeningFormData = { ...this.input.casa, customerNumber };
    const casaResult = await new CasaWorkflow(this.ctx, casaData).execute();
    this.pass(`CASA done: ${casaResult.checkerToast}`);

    return { customerToast: custResult.checkerToast, casaToast: casaResult.checkerToast };
  }
}
