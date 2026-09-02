import { BaseRepository } from '../../../framework/base/BaseRepository';
import { DatabaseConnectionManager } from '../../../framework/database/DatabaseConnectionManager';
import { CustomerModel } from '../models/CustomerModel';

export class CustomerRepository extends BaseRepository {
  constructor(db: DatabaseConnectionManager) { super(db); }

  async findByName(name: string): Promise<CustomerModel | null> {
    return this.queryOne<CustomerModel>(
      `SELECT TOP 1 * FROM CustomerMaster WHERE customerName LIKE @name ORDER BY createdDate DESC`,
      { name: `%${name}%` }
    );
  }

  async findById(customerId: string): Promise<CustomerModel | null> {
    return this.queryOne<CustomerModel>(
      `SELECT * FROM CustomerMaster WHERE customerId = @customerId`,
      { customerId }
    );
  }

  async getAuthStatus(customerId: string): Promise<string | null> {
    const row = await this.queryOne<{ authStatus: string }>(
      `SELECT authStatus FROM CustomerMaster WHERE customerId = @customerId`,
      { customerId }
    );
    return row?.authStatus ?? null;
  }
}
