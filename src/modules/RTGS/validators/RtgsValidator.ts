import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { DatabaseValidator } from '../../../framework/validators/DatabaseValidator';
import { RtgsRepository } from '../repositories/RtgsRepository';
import { logger } from '../../../framework/logger/logger';

export class RtgsValidator {
  private readonly repo: RtgsRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new RtgsRepository(db);
  }

  async validateCreated(acctNo: string): Promise<void> {
    const row = await this.repo.findByAccount(acctNo, 'P');
    new DatabaseValidator(row, `RTGS[acct:${acctNo}]`)
      .exists()
      .authStatus('P');
    logger.pass(`RTGS creation validated in DB ✓`);
  }

  async validateAuthorized(acctNo: string): Promise<void> {
    const row = await this.repo.findByAccount(acctNo, 'A');
    new DatabaseValidator(row, `RTGS[acct:${acctNo}]`)
      .exists()
      .authStatus('A');
    logger.pass(`RTGS authorization validated in DB ✓`);
  }
}
