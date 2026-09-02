import { CustomerData } from '../../modules/Customer/pages/CustomerCreationPage';
import { DateHelper } from './DateHelper';

const ts = () => Date.now().toString().slice(-6);

export class CustomerDataGenerator {
  /** Minimal valid data — only mandatory fields */
  static minimal(): CustomerData {
    const id = ts();
    return {
      customerCategory: '1',
      memberFName:      `Test${id}`,
      memberLName:      `User${id}`,
      memberDOB:        DateHelper.minusYears(30),
      proofType:        '2',
      idNumber:         `AAAA${id}A`,
    };
  }

  /** Full data — all common optional fields populated */
  static full(): CustomerData {
    const id = ts();
    return {
      ...this.minimal(),
      memberMName:      'Kumar',
      nameTitle:        '1',
      memberGender:     '1',
      mbrMaritalStatus: '1',
      nationality:      'India',
      residentialStatus:'1',
      residentYn:       'Y',
      pan:              `ABCDE${id}F`,
      mobileNo1:        `9${id.padStart(9, '0')}`,
      emailId:          `test${id}@example.com`,
      address1:         '123 Test Street',
      countryCode:      '1',
      stateCode:        '1',
      districtCode:     '1',
      pinCode:          '400001',
      KYCAvailableYn:   'Y',
      occupation:       '1',
      docType:          '1',
      issuedByCountry:  '1',
      nameAsInDocument: `Test${id} User${id}`,
    };
  }

  /** Boundary data — edge-case lengths and dates */
  static boundary(): { minName: CustomerData; maxName: CustomerData; minorDOB: CustomerData; exactAdult: CustomerData } {
    const base = this.minimal();
    return {
      minName:    { ...base, memberFName: 'A', memberLName: 'B' },
      maxName:    { ...base, memberFName: 'A'.repeat(50), memberLName: 'B'.repeat(50) },
      minorDOB:   { ...base, memberDOB: DateHelper.minusYears(17) },
      exactAdult: { ...base, memberDOB: DateHelper.minusYears(18) },
    };
  }

  /** Negative data — invalid/empty mandatory fields */
  static negative(): { emptyFirst: CustomerData; emptyLast: CustomerData; futureDOB: CustomerData; invalidPAN: CustomerData } {
    const base = this.minimal();
    return {
      emptyFirst:  { ...base, memberFName: '' },
      emptyLast:   { ...base, memberLName: '' },
      futureDOB:   { ...base, memberDOB: DateHelper.plusDays(1) },
      invalidPAN:  { ...base, pan: '12345' },
    };
  }
}
