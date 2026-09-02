import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { DatabaseValidator } from '../../../framework/validators/DatabaseValidator';
import { NachRepository } from '../repositories/NachRepository';
import { logger } from '../../../framework/logger/logger';

export class NachValidator {
  private readonly repo: NachRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new NachRepository(db);
  }

  async validateCreated(accountNo: string): Promise<void> {
    const row = await this.repo.findByAccount(accountNo, 'P');
    new DatabaseValidator(row, `NACH[acct:${accountNo}]`)
      .exists()
      .authStatus('P');
    logger.pass(`NACH creation validated in DB ✓`);
  }

  async validateAuthorized(accountNo: string): Promise<void> {
    const row = await this.repo.findByAccount(accountNo, 'A');
    new DatabaseValidator(row, `NACH[acct:${accountNo}]`)
      .exists()
      .authStatus('A');
    logger.pass(`NACH authorization validated in DB ✓`);
  }
}
