import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { DatabaseValidator } from '../../../framework/validators/DatabaseValidator';
import { LockerRepository } from '../repositories/LockerRepository';
import { logger } from '../../../framework/logger/logger';

export class LockerValidator {
  private readonly repo: LockerRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new LockerRepository(db);
  }

  async validateCreated(customerCode: string): Promise<void> {
    const row = await this.repo.findByCustomer(customerCode, 'P');
    new DatabaseValidator(row, `Locker[cust:${customerCode}]`)
      .exists()
      .authStatus('P');
    logger.pass(`Locker creation validated in DB ✓`);
  }

  async validateAuthorized(customerCode: string): Promise<void> {
    const row = await this.repo.findByCustomer(customerCode, 'A');
    new DatabaseValidator(row, `Locker[cust:${customerCode}]`)
      .exists()
      .authStatus('A')
      .fieldNotEmpty('lockerNo');
    logger.pass(`Locker authorization validated in DB ✓`);
  }
}
