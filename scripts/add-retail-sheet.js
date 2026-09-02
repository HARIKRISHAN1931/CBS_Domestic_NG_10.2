const XLSX = require('xlsx');
const fs   = require('fs');
const file = 'testdata/BCCB-QA/Customer.xlsx';
const out  = 'testdata/BCCB-QA/Customer_new.xlsx';

const wb = XLSX.readFile(file);
process.stdout.write('read ok, sheets: ' + wb.SheetNames.join(',') + '\n');

const retailData = [
  {
    customerCategory: '1',
    AMLRating:        '1',
    nameTitle:        '1',
    memberFName:      'Rajesh',
    memberMName:      'Kumar',
    memberLName:      'Sharma',
    motherFname:      'Sunita',
    motherLname:      'Sharma',
    memberDOB:        '15-06-1985',
    memberGender:     '1',
    nationality:      'INDIAN',
    mbrMaritalStatus: '2',
    residentialStatus:'1',
    residentYn:       'Y',
    form60Yn:         'N',
    disabilityYn:     'N',
    addressType:      '1',
    address1:         '12 Rabindra Sarani',
    address2:         'Burdwan',
    address3:         '',
    countryCode:      'IND',
    stateCode:        'WEST BENGAL',
    districtCode:     'BURDWAN',
    pinCode:          '713101',
    mobileNo1:        '9876543210',
    emailId:          'rajesh.sharma@testbank.com',
    KYCAvailableYn:   'Y',
    pepYn:            'N',
    occupation:       '1',
    religion:         '1',
    qualification:    '4',
    proofType:        '2',
    idNumber:         'ABCDE1234F',
    issuedDate:       '01-01-2020',
    expiryDate:       '',
    nameAsInDocument: 'Rajesh Kumar Sharma',
    issuedByCountry:  '1',
    tag:              'smoke',
  },
];

const ws = XLSX.utils.json_to_sheet(retailData);
XLSX.utils.book_append_sheet(wb, ws, 'retail-create');
process.stdout.write('sheets now: ' + wb.SheetNames.join(',') + '\n');

const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
process.stdout.write('buffer size: ' + buf.length + '\n');
fs.writeFileSync(out, buf);
process.stdout.write('written: ' + out + '\n');
