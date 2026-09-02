import { DatabaseConnectionManager } from '../database/DatabaseConnectionManager';
import { logger } from '../logger/logger';

export abstract class BaseRepository {
  protected readonly db: DatabaseConnectionManager;

  constructor(db: DatabaseConnectionManager) {
    this.db = db;
  }

  protected async query<T>(sql: string, params?: Record<string, unknown>): Promise<T[]> {
    logger.debug(`SQL: ${sql}`);
    return this.db.query<T>(sql, params);
  }

  protected async queryOne<T>(sql: string, params?: Record<string, unknown>): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  protected async execute(sql: string, params?: Record<string, unknown>): Promise<void> {
    logger.debug(`EXEC: ${sql}`);
    await this.db.execute(sql, params);
  }
}
