import { BaseRepository } from '../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../framework/config/tables';

const T = CBS_TABLES.RTGS_NEFT;

export interface RTGSRecord {
  setNo:       string;
  scrollNo:    string;
  authStatus:  string;
  isActive:    number;
  msgTrfType:  string;
  valueAmt:    number;
}

export class RTGSQueries extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findBySetNo(setNo: string): Promise<RTGSRecord | null> {
    return this.queryOne<RTGSRecord>(
      `SELECT setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
         FROM ${T.TRANSACTION}
        WHERE setNo = @setNo
        ORDER BY entryDate DESC`,
      { setNo }
    );
  }

  async findByScrollNo(scrollNo: string): Promise<RTGSRecord | null> {
    return this.queryOne<RTGSRecord>(
      `SELECT setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
         FROM ${T.TRANSACTION}
        WHERE scrollNo = @scrollNo
        ORDER BY entryDate DESC`,
      { scrollNo }
    );
  }

  async getAuthStatus(setNo: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM ${T.TRANSACTION} WHERE setNo = @setNo`,
      { setNo }
    );
    return row?.authStatus ?? null;
  }

  async getPendingCount(branchCode: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM ${T.TRANSACTION}
       WHERE authStatus = 'P' AND branchCode = @branchCode`,
      { branchCode }
    );
    return row?.cnt ?? 0;
  }
}
