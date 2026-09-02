import { BaseRepository } from '../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../framework/config/tables';

const T = CBS_TABLES.LOAN;

export interface LoanRecord {
  loanId:       string;
  customerId:   string;
  loanAmount:   number;
  tenureMonths: number;
  status:       string;
  authStatus?:  string;
  isActive?:    number;
  branchCode?:  string;
}

export class LoanQueries extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByLoanId(loanId: string): Promise<LoanRecord | null> {
    return this.queryOne<LoanRecord>(
      `SELECT loanId, customerId, loanAmount, tenureMonths, status
         FROM ${T.LIMIT} WHERE loanId = @loanId`,
      { loanId }
    );
  }

  async findByCustomerId(customerId: string): Promise<LoanRecord[]> {
    return this.query<LoanRecord>(
      `SELECT loanId, customerId, loanAmount, tenureMonths, status
         FROM ${T.LIMIT} WHERE customerId = @customerId`,
      { customerId }
    );
  }

  async getTransactions(loanId: string): Promise<{ txnDate: string; txnAmount: number; txnType: string }[]> {
    return this.query(
      `SELECT txnDate, txnAmount, txnType FROM ${T.TRANSACTION}
       WHERE loanId = @loanId ORDER BY txnDate DESC`,
      { loanId }
    );
  }
}
