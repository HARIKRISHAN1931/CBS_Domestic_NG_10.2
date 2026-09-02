import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';

export interface EmployeeRecord extends Record<string, unknown> {
  EMP_ID?:      string;
  EMP_NAME?:    string;
  AUTH_STATUS?: string;
  IS_ACTIVE?:   number;
}

export interface UserRecord extends Record<string, unknown> {
  LOGIN_ID?:    string;
  EMP_ID?:      string;
  AUTH_STATUS?: string;
  IS_ACTIVE?:   number;
}

export class AdministrationRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findEmployee(empId: string): Promise<EmployeeRecord | null> {
    return this.queryOne<EmployeeRecord>(
      `SELECT * FROM EMPLOYEEMST WHERE EMP_ID = :empId`,
      { empId },
    );
  }

  async findUser(loginId: string): Promise<UserRecord | null> {
    return this.queryOne<UserRecord>(
      `SELECT * FROM USERMGMT WHERE LOGIN_ID = :loginId`,
      { loginId },
    );
  }

  async getEmployeeAuthStatus(empId: string): Promise<string | null> {
    const row = await this.queryOne<{ AUTH_STATUS: string }>(
      `SELECT AUTH_STATUS FROM EMPLOYEEMST WHERE EMP_ID = :empId`,
      { empId },
    );
    return row?.AUTH_STATUS ?? null;
  }
}
