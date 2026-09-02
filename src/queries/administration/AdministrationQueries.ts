import { BaseRepository } from '../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../framework/database/DatabaseConnectionManager';
import { CBS_TABLES } from '../../framework/config/tables';

const T = CBS_TABLES.ADMINISTRATION;
const G = CBS_TABLES.GEOGRAPHY;

export interface EmployeeRecord {
  empId:      string;
  empName:    string;
  empFName:   string;
  empLName:   string;
  authStatus: string;   // U=Unauthorized P=Pending A=Authorized R=Rejected
  isActive:   number;   // 1=active 0=inactive
  joinDate:   string;
  dept:       string;
  empStatus:  string;   // 1=Active 2=Suspended 3=Retired 4=Transferred
  gender:     string;   // 1=FEMALE 2=MALE 3=TRANSGENDER
  mobile:     string;
  email:      string;
}

export interface GeographyRecord {
  authStatus: string;
  isActive:   number;
}

export class AdministrationQueries extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  // ── Employee ──────────────────────────────────────────────────────────────
  async findEmployeeById(empId: string): Promise<EmployeeRecord | null> {
    return this.queryOne<EmployeeRecord>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM ${T.EMPLOYEE} WHERE empId = @empId`,
      { empId }
    );
  }

  async findEmployeeByName(empName: string): Promise<EmployeeRecord | null> {
    return this.queryOne<EmployeeRecord>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM ${T.EMPLOYEE}
        WHERE empName LIKE @empName AND isActive = 1`,
      { empName: `%${empName}%` }
    );
  }

  async findEmployeeAuthorized(empId: string): Promise<EmployeeRecord | null> {
    return this.queryOne<EmployeeRecord>(
      `SELECT empId, empName, empFName, empLName, authStatus, isActive,
              joinDate, dept, empStatus, gender, mobile, email
         FROM ${T.EMPLOYEE}
        WHERE empId = @empId AND authStatus = 'A' AND isActive = 1`,
      { empId }
    );
  }

  async countEmployeeByAuthStatus(authStatus: string): Promise<number> {
    const row = await this.queryOne<{ cnt: number }>(
      `SELECT COUNT(*) AS cnt FROM ${T.EMPLOYEE}
       WHERE authStatus = @authStatus AND isActive = 1`,
      { authStatus }
    );
    return row?.cnt ?? 0;
  }

  // ── Geography masters ─────────────────────────────────────────────────────
  async findStateByCode(stateCode: string): Promise<GeographyRecord | null> {
    return this.queryOne<GeographyRecord>(
      `SELECT authStatus, isActive FROM ${G.STATE}
       WHERE stateCode = @stateCode AND isActive = 1`,
      { stateCode }
    );
  }

  async findDistrictByCode(districtCode: string): Promise<GeographyRecord | null> {
    return this.queryOne<GeographyRecord>(
      `SELECT authStatus, isActive FROM ${G.DISTRICT}
       WHERE districtCode = @districtCode AND isActive = 1`,
      { districtCode }
    );
  }

  async findCountryByCode(countryCode: string): Promise<GeographyRecord | null> {
    return this.queryOne<GeographyRecord>(
      `SELECT authStatus, isActive FROM ${G.COUNTRY}
       WHERE countryCode = @countryCode AND isActive = 1`,
      { countryCode }
    );
  }
}
