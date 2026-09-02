import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

export interface NachRecord extends Record<string, unknown> {
  mandateId?:   string;
  accountNo?:   string;
  umrn?:        string;
  authStatus?:  string;
  isActive?:    number;
  amount?:      number;
  frequency?:   string;
}

export class NachRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByAccount(accountNo: string, status = 'A'): Promise<NachRecord | null> {
    return this.queryOne<NachRecord>(
      `SELECT TOP 1 mandateId, accountNo, umrn, authStatus, isActive, amount, frequency
         FROM DBTLMST
        WHERE accountNo = @accountNo AND authStatus = @status AND isActive = 1
        ORDER BY createdDate DESC`,
      { accountNo, status },
    );
  }

  async findByUmrn(umrn: string): Promise<NachRecord | null> {
    return this.queryOne<NachRecord>(
      `SELECT mandateId, accountNo, umrn, authStatus, isActive, amount, frequency
         FROM DBTLMST WHERE umrn = @umrn`,
      { umrn },
    );
  }

  async getAuthStatus(mandateId: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM DBTLMST WHERE mandateId = @mandateId`,
      { mandateId },
    );
    return row?.authStatus ?? null;
  }
}
