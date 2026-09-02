export type AuthStatus    = 'P' | 'A' | 'R' | 'U';
export type RecordStatus  = 0 | 1;
export type TransactionType = 'D' | 'C';
export type CustomerType  = 'R' | 'C' | 'S';
export type LoanStatus    = 'A' | 'C' | 'N' | 'W';
export type TDStatus      = 'A' | 'M' | 'C' | 'R';
export type ProcessType   = 'EOD' | 'BOD';
export type BankCode      = 'BDCC' | 'BCCB' | string;
export type Environment   = 'qa' | 'uat' | 'sit' | 'prod';

export interface BaseRecord {
  id?:         number | string;
  authStatus?: AuthStatus;
  isActive?:   RecordStatus;
  createdBy?:  string;
  createdAt?:  string;
  updatedBy?:  string;
  updatedAt?:  string;
}

export interface ValidationResult {
  passed:   boolean;
  failures: string[];
}
