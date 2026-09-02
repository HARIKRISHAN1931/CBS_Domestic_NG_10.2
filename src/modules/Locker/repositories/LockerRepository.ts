import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

export interface LockerRecord extends Record<string, unknown> {
  lockerId?:    string;
  customerCode?:string;
  lockerNo?:    string;
  authStatus?:  string;
  isActive?:    number;
  issueDate?:   string;
  expiryDate?:  string;
}

export class LockerRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByCustomer(customerCode: string, status = 'A'): Promise<LockerRecord | null> {
    return this.queryOne<LockerRecord>(
      `SELECT TOP 1 lockerId, customerCode, lockerNo, authStatus, isActive, issueDate, expiryDate
         FROM LOCKERISSUEREG
        WHERE customerCode = @customerCode AND authStatus = @status AND isActive = 1
        ORDER BY issueDate DESC`,
      { customerCode, status },
    );
  }

  async findByLockerNo(lockerNo: string): Promise<LockerRecord | null> {
    return this.queryOne<LockerRecord>(
      `SELECT lockerId, customerCode, lockerNo, authStatus, isActive, issueDate, expiryDate
         FROM LOCKERISSUEREG WHERE lockerNo = @lockerNo AND isActive = 1`,
      { lockerNo },
    );
  }

  async getAuthStatus(lockerId: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM LOCKERISSUEREG WHERE lockerId = @lockerId`,
      { lockerId },
    );
    return row?.authStatus ?? null;
  }
}
