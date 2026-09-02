import { BaseWorkflow, WorkflowContext } from '../base/BaseWorkflow';
import { CustomerWorkflow } from '../../modules/Customer/workflows/CustomerWorkflow';
import { CustomerData } from '../../modules/Customer/pages/CustomerCreationPage';
import { TDContractData } from '../../modules/TD/pages/TermDepositPage';
import { SharedDataStore } from '../../framework/utils/SharedDataStore';

export interface CustomerToTdInput {
  customer: CustomerData;
  td:       Omit<TDContractData, 'customerCode'>;
}

export class CustomerToTdWorkflow extends BaseWorkflow {
  constructor(ctx: WorkflowContext, private readonly input: CustomerToTdInput) {
    super(ctx);
  }

  async execute(): Promise<{ customerToast: string; tdToast: string }> {
    this.log('Step 1 — Customer creation (maker + checker)');
    const custResult = await new CustomerWorkflow(this.ctx, this.input.customer).execute();
    this.pass(`Customer done: ${custResult.referenceId}`);

    const customerNumber = SharedDataStore.get<string>('lastCustomerName') ?? custResult.referenceId ?? '';

    this.log('Step 2 — TD contract (maker + checker)');
    // TD workflow imported dynamically when TD module is implemented
    const { TdWorkflow } = await import('../../modules/TD/workflows/TdWorkflow');
    const tdData: TDContractData = { customerCode: customerNumber, depositMonths: '12', productCode: '', schemeCode: '', depositAmount: '', ...this.input.td };
    const tdResult = await new TdWorkflow(this.ctx, tdData).execute();
    this.pass(`TD done: ${tdResult.checkerToast}`);

    return { customerToast: custResult.checkerToast, tdToast: tdResult.checkerToast };
  }
}
