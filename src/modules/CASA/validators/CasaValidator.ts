import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { DatabaseValidator } from '../../../framework/validators/DatabaseValidator';
import { CasaRepository } from '../repositories/CasaRepository';
import { logger } from '../../../framework/logger/logger';

export class CasaValidator {
  private readonly repo: CasaRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new CasaRepository(db);
  }

  async validateCreated(customerId: string): Promise<void> {
    const row = await this.repo.findByCustomer(customerId, 'P');
    new DatabaseValidator(row, `CASA[cust:${customerId}]`)
      .exists()
      .authStatus('P');
    logger.pass(`CASA creation validated in DB ✓`);
  }

  async validateAuthorized(customerId: string): Promise<void> {
    const row = await this.repo.findByCustomer(customerId, 'A');
    new DatabaseValidator(row, `CASA[cust:${customerId}]`)
      .exists()
      .authStatus('A')
      .fieldNotEmpty('accountNo');
    logger.pass(`CASA authorization validated in DB ✓`);
  }
}
