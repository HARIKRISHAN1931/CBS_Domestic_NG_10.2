export interface CustomerModel extends Record<string, unknown> {
  customerId?:    string;
  customerName:   string;
  customerType:   'R' | 'C' | 'S';
  dateOfBirth?:   string;
  mobileNo?:      string;
  emailId?:       string;
  panNo?:         string;
  aadharNo?:      string;
  address?:       string;
  branchCode?:    string;
  authStatus?:    string;
  isActive?:      number;
}

export interface CustomerCreateInput {
  firstName:    string;
  lastName:     string;
  customerType: 'R' | 'C' | 'S';
  dateOfBirth?: string;
  mobileNo?:    string;
  emailId?:     string;
  panNo?:       string;
  aadharNo?:    string;
  branchCode?:  string;
}
