/**
 * CBS Table Registry
 * All physical table names used across the CBS 10.2 schema.
 * Source: migrated from CBS10.2/src/framework/config/tables.ts + all module repositories.
 *
 * BDCC (SQL Server) and BCCB (Oracle) share the same table names.
 */
export const CBS_TABLES = {
  TENANT: {
    MASTER: 'D001001',
  },
  CUSTOMER: {
    MASTER:    'D009011',   // custNo, custName, authStatus, isActive
    ADDRESS:   'D010055',   // custNo, address1, countryCode, stateCode, pinCode
    DOCUMENTS: 'D009193',   // custNo, docType, docNo, authStatus
  },
  ACCOUNT: {
    MASTER:  'D009022',     // accountNo, customerId, moduleCode, productCode, schemeCode, branchCode, openDate, authStatus, isActive, operMode
    NOMINEE: 'D009028',
    MODULE:  'D009033',
    LEDGER:  'D009040',
  },
  TD: {
    CONTRACT:              'D020004',   // prdAcctId, customerId, productCode, schemeCode, depositAmount, depositMonths, depositDays, openDate, maturityDate, depositStatus, authStatus, isActive, branchCode, applRate, matAmount
    PARAM:                 'D020002',
    INTEREST_PAYOUT:       'D020006',
    INTEREST_PAYOUT_CHILD: 'D020106',
    MATURITY:              'D020007',
    MATURITY_CHILD:        'D020107',
  },
  LOAN: {
    LIMIT:       'D030042',
    TRANSACTION: 'D620005',
  },
  RTGS_NEFT: {
    CONFIG:      'D946021',
    TRANSACTION: 'D946020',   // setNo, scrollNo, authStatus, isActive, msgTrfType, valueAmt
    QUEUE:       'D946120',
  },
  GEOGRAPHY: {
    COUNTRY:      'D009504',
    STATE:        'D009505',   // stateCode, authStatus, isActive
    DISTRICT:     'D009500',   // districtCode, authStatus, isActive
  },
  ADMINISTRATION: {
    EMPLOYEE: 'EMPLOYEEMASTER',   // empId, empName, empFName, empLName, authStatus, isActive, joinDate, dept, empStatus, gender, mobile, email
    USER:     'USERMASTER',
    BRANCH:   'BRANCHMASTER',
  },
} as const;

export type CbsTableKey = typeof CBS_TABLES;
