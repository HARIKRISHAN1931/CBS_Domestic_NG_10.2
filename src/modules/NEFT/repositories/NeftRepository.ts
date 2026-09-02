import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../../framework/config/tables';

const T = CBS_TABLES.RTGS_NEFT;

export interface NeftRecord extends Record<string, unknown> {
  setNo:      string;
  scrollNo:   string;
  authStatus: string;
  isActive:   number;
  msgTrfType: string;
  valueAmt:   number;
}

export class NeftRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findBySetNo(setNo: string): Promise<NeftRecord | null> {
    return this.queryOne<NeftRecord>(
      `SELECT TOP 1 setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
         FROM ${T.TRANSACTION}
        WHERE setNo = @setNo AND msgTrfType IN ('NEFT','02')
        ORDER BY entryDate DESC`,
      { setNo },
    );
  }

  async findPendingByAccount(acctNo: string): Promise<NeftRecord | null> {
    return this.queryOne<NeftRecord>(
      `SELECT TOP 1 setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
         FROM ${T.TRANSACTION}
        WHERE acctNo = @acctNo AND authStatus = 'P' AND msgTrfType IN ('NEFT','02')
        ORDER BY entryDate DESC`,
      { acctNo },
    );
  }

  async getAuthStatus(setNo: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM ${T.TRANSACTION} WHERE setNo = @setNo`,
      { setNo },
    );
    return row?.authStatus ?? null;
  }
}
