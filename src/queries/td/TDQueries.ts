import { BaseRepository } from '../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../framework/config/tables';

const T = CBS_TABLES.TD;

export interface TDRecord {
  prdAcctId:     string;
  customerId:    string;
  productCode:   string;
  schemeCode:    string;
  depositAmount: number;
  depositMonths: number;
  depositDays:   number;
  openDate:      string;
  maturityDate:  string;
  depositStatus: string;   // 1=NOT AUTHORIZED 2=AUTHORIZED 3=FUNDS RECEIVED 4=MATURED 6=CLOSED 98=CANCELLED
  authStatus:    string;   // U=Unauthorized A=Authorized R=Rejected
  isActive:      number;
  branchCode:    string;
  applRate:      number;
  matAmount:     number;
}

export class TDQueries extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByAccountId(prdAcctId: string): Promise<TDRecord | null> {
    return this.queryOne<TDRecord>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM ${T.CONTRACT} WHERE prdAcctId = @prdAcctId`,
      { prdAcctId }
    );
  }

  async findByCustomerId(customerId: string): Promise<TDRecord[]> {
    return this.query<TDRecord>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM ${T.CONTRACT}
        WHERE customerId = @customerId AND isActive = 1
        ORDER BY openDate DESC`,
      { customerId }
    );
  }

  async findAuthorized(prdAcctId: string): Promise<TDRecord | null> {
    return this.queryOne<TDRecord>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM ${T.CONTRACT}
        WHERE prdAcctId = @prdAcctId AND authStatus = 'A' AND isActive = 1`,
      { prdAcctId }
    );
  }

  async findPending(): Promise<TDRecord[]> {
    return this.query<TDRecord>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM ${T.CONTRACT} WHERE authStatus IN ('U','P') AND isActive = 1`
    );
  }

  async findByProduct(productCode: string): Promise<TDRecord[]> {
    return this.query<TDRecord>(
      `SELECT prdAcctId, customerId, productCode, schemeCode, depositAmount,
              depositMonths, depositDays, openDate, maturityDate, depositStatus,
              authStatus, isActive, branchCode, applRate, matAmount
         FROM ${T.CONTRACT} WHERE productCode = @productCode AND isActive = 1`,
      { productCode }
    );
  }

  async getMaturityAmount(prdAcctId: string): Promise<number> {
    const row = await this.queryOne<{ matAmount: number }>(
      `SELECT matAmount FROM ${T.CONTRACT} WHERE prdAcctId = @prdAcctId`,
      { prdAcctId }
    );
    return row?.matAmount ?? 0;
  }

  async countByCustomer(customerId: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM ${T.CONTRACT}
       WHERE customerId = @customerId AND isActive = 1`,
      { customerId }
    );
    return row?.cnt ?? 0;
  }

  async countByStatus(depositStatus: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM ${T.CONTRACT}
       WHERE depositStatus = @depositStatus AND isActive = 1`,
      { depositStatus }
    );
    return row?.cnt ?? 0;
  }
}
