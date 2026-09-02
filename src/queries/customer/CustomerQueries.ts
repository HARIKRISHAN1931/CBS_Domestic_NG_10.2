import { BaseRepository } from '../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../framework/config/tables';

const T = CBS_TABLES.CUSTOMER;

export interface CustomerRecord {
  custNo:      number;
  custName:    string;
  authStatus:  string;
  isActive:    number;
  branchCode?: string;
  mobileNo?:   string;
  panNo?:      string;
  aadharNo?:   string;
}

export interface CustomerAddressRecord {
  custNo:      number;
  address1:    string;
  countryCode: string;
  stateCode:   string;
  pinCode:     string;
  authStatus:  string;
}

export interface CustomerDocRecord {
  custNo:     number;
  docType:    string;
  docNo:      string;
  authStatus: string;
}

export class CustomerQueries extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByName(name: string): Promise<CustomerRecord | null> {
    return this.queryOne<CustomerRecord>(
      `SELECT TOP 1 custNo, custName, authStatus, isActive FROM ${T.MASTER}
       WHERE custName LIKE @name AND isActive = 1 ORDER BY custNo DESC`,
      { name: `%${name}%` }
    );
  }

  async findByCustNo(custNo: string): Promise<CustomerRecord | null> {
    return this.queryOne<CustomerRecord>(
      `SELECT custNo, custName, authStatus, isActive FROM ${T.MASTER}
       WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }

  async findAddress(custNo: string): Promise<CustomerAddressRecord | null> {
    return this.queryOne<CustomerAddressRecord>(
      `SELECT custNo, address1, countryCode, stateCode, pinCode, authStatus
       FROM ${T.ADDRESS} WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }

  async findDocuments(custNo: string): Promise<CustomerDocRecord[]> {
    return this.query<CustomerDocRecord>(
      `SELECT custNo, docType, docNo, authStatus FROM ${T.DOCUMENTS}
       WHERE custNo = @custNo AND isActive = 1`,
      { custNo }
    );
  }

  async getAuthStatus(custNo: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM ${T.MASTER} WHERE custNo = @custNo`,
      { custNo }
    );
    return row?.authStatus ?? null;
  }

  async getPendingCount(branchCode: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM ${T.MASTER}
       WHERE authStatus = 'P' AND branchCode = @branchCode`,
      { branchCode }
    );
    return row?.cnt ?? 0;
  }
}
