import { BaseRepository } from '../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../framework/config/tables';

const T = CBS_TABLES.RTGS_NEFT;

export interface NEFTRecord {
  setNo:      string;
  scrollNo:   string;
  authStatus: string;
  isActive:   number;
  msgTrfType: string;
  valueAmt:   number;
}

export class NEFTQueries extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findBySetNo(setNo: string): Promise<NEFTRecord | null> {
    return this.queryOne<NEFTRecord>(
      `SELECT setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
         FROM ${T.TRANSACTION}
        WHERE setNo = @setNo AND msgTrfType = 'NEFT'
        ORDER BY entryDate DESC`,
      { setNo }
    );
  }

  async findByScrollNo(scrollNo: string): Promise<NEFTRecord | null> {
    return this.queryOne<NEFTRecord>(
      `SELECT setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
         FROM ${T.TRANSACTION}
        WHERE scrollNo = @scrollNo AND msgTrfType = 'NEFT'
        ORDER BY entryDate DESC`,
      { scrollNo }
    );
  }

  async getPendingCount(branchCode: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM ${T.TRANSACTION}
       WHERE authStatus = 'P' AND msgTrfType = 'NEFT' AND branchCode = @branchCode`,
      { branchCode }
    );
    return row?.cnt ?? 0;
  }
}
