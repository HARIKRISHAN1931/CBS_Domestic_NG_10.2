import { BaseRepository } from '../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../framework/config/tables';

const T = CBS_TABLES.ACCOUNT;

export interface CasaRecord {
  accountNo:   string;
  customerId:  string;
  moduleCode:  string;
  productCode: string;
  schemeCode:  string;
  branchCode:  string;
  openDate:    string;
  authStatus:  string;   // U=Unauthorized P=Pending A=Authorized R=Rejected
  isActive:    number;
  operMode:    string;
}

export class CASAQueries extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByAccountNo(accountNo: string): Promise<CasaRecord | null> {
    return this.queryOne<CasaRecord>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM ${T.MASTER} WHERE accountNo = @accountNo`,
      { accountNo }
    );
  }

  async findByCustomerId(customerId: string): Promise<CasaRecord[]> {
    return this.query<CasaRecord>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM ${T.MASTER} WHERE customerId = @customerId AND isActive = 1`,
      { customerId }
    );
  }

  async findAuthorized(accountNo: string): Promise<CasaRecord | null> {
    return this.queryOne<CasaRecord>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM ${T.MASTER}
        WHERE accountNo = @accountNo AND authStatus = 'A' AND isActive = 1`,
      { accountNo }
    );
  }

  async findPending(): Promise<CasaRecord[]> {
    return this.query<CasaRecord>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM ${T.MASTER} WHERE authStatus IN ('U','P') AND isActive = 1`
    );
  }

  async getAuthStatus(accountNo: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM ${T.MASTER} WHERE accountNo = @accountNo`,
      { accountNo }
    );
    return row?.authStatus ?? null;
  }

  async countByCustomer(customerId: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM ${T.MASTER}
       WHERE customerId = @customerId AND isActive = 1`,
      { customerId }
    );
    return row?.cnt ?? 0;
  }
}
