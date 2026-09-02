import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { DatabaseValidator } from '../../../framework/validators/DatabaseValidator';
import { TdRepository } from '../repositories/TdRepository';
import { logger } from '../../../framework/logger/logger';

export class TdValidator {
  private readonly repo: TdRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new TdRepository(db);
  }

  async validateCreated(custNo: string): Promise<void> {
    const row = await this.repo.findByCustomer(custNo, 'P');
    new DatabaseValidator(row, `TD[cust:${custNo}]`)
      .exists()
      .authStatus('P');
    logger.pass(`TD creation validated in DB ✓`);
  }

  async validateAuthorized(custNo: string): Promise<void> {
    const row = await this.repo.findByCustomer(custNo, 'A');
    new DatabaseValidator(row, `TD[cust:${custNo}]`)
      .exists()
      .authStatus('A')
      .fieldNotEmpty('TD_ACCT_NO');
    logger.pass(`TD authorization validated in DB ✓`);
  }
}
