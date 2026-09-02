import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../../framework/config/tables';

const T = CBS_TABLES.ACCOUNT;

export interface CasaRecord extends Record<string, unknown> {
  accountNo:   string;
  customerId:  string;
  moduleCode:  string;
  productCode: string;
  schemeCode:  string;
  branchCode:  string;
  openDate:    string;
  authStatus:  string;
  isActive:    number;
  operMode:    string;
}

export class CasaRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByCustomer(customerId: string, status = 'A'): Promise<CasaRecord | null> {
    return this.queryOne<CasaRecord>(
      `SELECT TOP 1 accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM ${T.MASTER}
        WHERE customerId = @customerId AND authStatus = @status AND isActive = 1
        ORDER BY openDate DESC`,
      { customerId, status },
    );
  }

  async findByAccount(accountNo: string): Promise<CasaRecord | null> {
    return this.queryOne<CasaRecord>(
      `SELECT accountNo, customerId, moduleCode, productCode, schemeCode,
              branchCode, openDate, authStatus, isActive, operMode
         FROM ${T.MASTER} WHERE accountNo = @accountNo`,
      { accountNo },
    );
  }

  async getAuthStatus(accountNo: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM ${T.MASTER} WHERE accountNo = @accountNo`,
      { accountNo },
    );
    return row?.authStatus ?? null;
  }
}
