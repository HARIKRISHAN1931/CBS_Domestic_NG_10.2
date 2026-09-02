import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { DatabaseValidator } from '../../../framework/validators/DatabaseValidator';
import { NeftRepository } from '../repositories/NeftRepository';
import { logger } from '../../../framework/logger/logger';

export class NeftValidator {
  private readonly repo: NeftRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new NeftRepository(db);
  }

  async validateCreated(acctNo: string): Promise<void> {
    const row = await this.repo.findPendingByAccount(acctNo);
    new DatabaseValidator(row, `NEFT[acct:${acctNo}]`)
      .exists()
      .authStatus('P');
    logger.pass(`NEFT creation validated in DB ✓`);
  }

  async validateAuthorized(setNo: string): Promise<void> {
    const row = await this.repo.findBySetNo(setNo);
    new DatabaseValidator(row, `NEFT[set:${setNo}]`)
      .exists()
      .authStatus('A');
    logger.pass(`NEFT authorization validated in DB ✓`);
  }
}
