import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { DatabaseValidator } from '../../../framework/validators/DatabaseValidator';
import { AdministrationRepository } from '../repositories/AdministrationRepository';
import { logger } from '../../../framework/logger/logger';

export class AdministrationValidator {
  private readonly repo: AdministrationRepository;

  constructor(db: DatabaseConnectionManager) {
    this.repo = new AdministrationRepository(db);
  }

  async validateEmployeeCreated(empId: string): Promise<void> {
    const row = await this.repo.findEmployee(empId);
    new DatabaseValidator(row, `Employee[${empId}]`)
      .exists()
      .authStatus('P');
    logger.pass(`Employee creation validated in DB ✓`);
  }

  async validateEmployeeAuthorized(empId: string): Promise<void> {
    const row = await this.repo.findEmployee(empId);
    new DatabaseValidator(row, `Employee[${empId}]`)
      .exists()
      .authStatus('A');
    logger.pass(`Employee authorization validated in DB ✓`);
  }

  async validateUserCreated(loginId: string): Promise<void> {
    const row = await this.repo.findUser(loginId);
    new DatabaseValidator(row, `User[${loginId}]`)
      .exists()
      .authStatus('P');
    logger.pass(`User creation validated in DB ✓`);
  }

  async validateUserAuthorized(loginId: string): Promise<void> {
    const row = await this.repo.findUser(loginId);
    new DatabaseValidator(row, `User[${loginId}]`)
      .exists()
      .authStatus('A');
    logger.pass(`User authorization validated in DB ✓`);
  }
}
