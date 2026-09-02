import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

export interface RtgsRecord extends Record<string, unknown> {
  TXN_REF_NO?:   string;
  ACCT_NO?:      string;
  TXN_AMT?:      number;
  AUTH_STATUS?:  string;
  MSG_TRF_TYPE?: string;
  BEN_IFSC?:     string;
}

export class RtgsRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByAccount(acctNo: string, status = 'A'): Promise<RtgsRecord | null> {
    return this.queryOne<RtgsRecord>(
      `SELECT TOP 1 * FROM TRANSACTIONMST WHERE ACCT_NO = :acctNo AND AUTH_STATUS = :status ORDER BY TXN_DATE DESC`,
      { acctNo, status },
    );
  }

  async findByRef(txnRefNo: string): Promise<RtgsRecord | null> {
    return this.queryOne<RtgsRecord>(
      `SELECT * FROM TRANSACTIONMST WHERE TXN_REF_NO = :txnRefNo`,
      { txnRefNo },
    );
  }
}
