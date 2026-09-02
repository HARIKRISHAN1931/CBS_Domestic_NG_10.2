export enum AuthStatus {
  Pending    = 'P',
  Authorized = 'A',
  Rejected   = 'R',
  Unverified = 'U',
}

export enum RecordStatus {
  Active   = 1,
  Inactive = 0,
}

export enum TransactionType {
  Debit  = 'D',
  Credit = 'C',
}

export enum LoanStatus {
  Active     = 'A',
  Closed     = 'C',
  NPA        = 'N',
  WrittenOff = 'W',
}

export enum TDStatus {
  Active  = 'A',
  Matured = 'M',
  Closed  = 'C',
  Renewed = 'R',
}

export enum CustomerType {
  Retail    = 'R',
  Corporate = 'C',
  Staff     = 'S',
}

export enum ProcessType {
  EOD = 'EOD',
  BOD = 'BOD',
}

export enum BankCode {
  BDCC = 'BDCC',
  BCCB = 'BCCB',
}
