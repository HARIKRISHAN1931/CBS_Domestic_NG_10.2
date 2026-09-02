import { DatabaseValidator } from '../../../common/validators/DatabaseValidator';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { logger } from '../../../framework/logger/logger';

export class CustomerValidator {
  private readonly repo: CustomerRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new CustomerRepository(db);
  }

  async validateCreated(customerName: string): Promise<void> {
    const record = await this.repo.findByName(customerName);
    new DatabaseValidator(record, `Customer[${customerName}]`)
      .exists()
      .authStatus('P')
      .fieldNotEmpty('customerId');
    logger.pass(`Customer creation validated in DB ✓`);
  }

  async validateAuthorized(customerId: string): Promise<void> {
    const record = await this.repo.findById(customerId);
    new DatabaseValidator(record, `Customer[${customerId}]`)
      .exists()
      .authStatus('A')
      .isActive(1);
    logger.pass(`Customer authorization validated in DB ✓`);
  }
}
