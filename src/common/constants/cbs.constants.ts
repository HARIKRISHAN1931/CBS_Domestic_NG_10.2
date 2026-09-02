export const CBS_CONSTANTS = {
  AUTH_STATUS: {
    PENDING:    'P',
    AUTHORIZED: 'A',
    REJECTED:   'R',
    UNVERIFIED: 'U',
  },
  RECORD_STATUS: {
    ACTIVE:   1,
    INACTIVE: 0,
  },
  TRANSACTION_TYPE: {
    DEBIT:  'D',
    CREDIT: 'C',
  },
  LOAN_STATUS: {
    ACTIVE:   'A',
    CLOSED:   'C',
    NPA:      'N',
    WRITTEN_OFF: 'W',
  },
  TD_STATUS: {
    ACTIVE:   'A',
    MATURED:  'M',
    CLOSED:   'C',
    RENEWED:  'R',
  },
  PROCESS: {
    EOD: 'EOD',
    BOD: 'BOD',
  },
} as const;
