import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../../framework/config/tables';

const T = CBS_TABLES.LOAN;

export interface LoanRecord extends Record<string, unknown> {
  loanId?:       string;
  customerId?:   string;
  loanAmount?:   number;
  tenureMonths?: number;
  authStatus?:   string;
  isActive?:     number;
  branchCode?:   string;
  sanctionDate?: string;
}

export class LoanRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByCustomer(customerId: string, status = 'A'): Promise<LoanRecord | null> {
    return this.queryOne<LoanRecord>(
      `SELECT TOP 1 loanId, customerId, loanAmount, tenureMonths, authStatus, isActive, branchCode, sanctionDate
         FROM ${T.LIMIT}
        WHERE customerId = @customerId AND authStatus = @status AND isActive = 1
        ORDER BY sanctionDate DESC`,
      { customerId, status },
    );
  }

  async findByLoanId(loanId: string): Promise<LoanRecord | null> {
    return this.queryOne<LoanRecord>(
      `SELECT loanId, customerId, loanAmount, tenureMonths, authStatus, isActive, branchCode, sanctionDate
         FROM ${T.LIMIT} WHERE loanId = @loanId`,
      { loanId },
    );
  }

  async getAuthStatus(loanId: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM ${T.LIMIT} WHERE loanId = @loanId`,
      { loanId },
    );
    return row?.authStatus ?? null;
  }
}
