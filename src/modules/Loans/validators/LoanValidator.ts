import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { DatabaseValidator } from '../../../framework/validators/DatabaseValidator';
import { LoanRepository } from '../repositories/LoanRepository';
import { logger } from '../../../framework/logger/logger';

export class LoanValidator {
  private readonly repo: LoanRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new LoanRepository(db);
  }

  async validateCreated(customerId: string): Promise<void> {
    const row = await this.repo.findByCustomer(customerId, 'P');
    new DatabaseValidator(row, `Loan[cust:${customerId}]`)
      .exists()
      .authStatus('P');
    logger.pass(`Loan creation validated in DB ✓`);
  }

  async validateAuthorized(customerId: string): Promise<void> {
    const row = await this.repo.findByCustomer(customerId, 'A');
    new DatabaseValidator(row, `Loan[cust:${customerId}]`)
      .exists()
      .authStatus('A')
      .fieldNotEmpty('loanId');
    logger.pass(`Loan authorization validated in DB ✓`);
  }
}
