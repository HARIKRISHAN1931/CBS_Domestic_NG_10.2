import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

export interface TdRecord extends Record<string, unknown> {
  TD_ACCT_NO?:   string;
  CUST_NO?:      string;
  AUTH_STATUS?:  string;
  DEP_AMT?:      number;
  MAT_DATE?:     string;
  INT_RATE?:     number;
}

export class TdRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByCustomer(custNo: string, status = 'A'): Promise<TdRecord | null> {
    return this.queryOne<TdRecord>(
      `SELECT * FROM TERMDEPOSITCONTRACTD WHERE CUST_NO = :custNo AND AUTH_STATUS = :status`,
      { custNo, status },
    );
  }

  async findByAccount(tdAcctNo: string): Promise<TdRecord | null> {
    return this.queryOne<TdRecord>(
      `SELECT * FROM TERMDEPOSITCONTRACTD WHERE TD_ACCT_NO = :tdAcctNo`,
      { tdAcctNo },
    );
  }

  async getAuthStatus(tdAcctNo: string): Promise<string | null> {
    const row = await this.queryOne<{ AUTH_STATUS: string }>(
      `SELECT AUTH_STATUS FROM TERMDEPOSITCONTRACTD WHERE TD_ACCT_NO = :tdAcctNo`,
      { tdAcctNo },
    );
    return row?.AUTH_STATUS ?? null;
  }
}
