import { config } from '../config/config';
import { logger } from '../logger/logger';

type Dialect = 'mssql' | 'oracle';

interface DbDriver {
  query<T>(sql: string, params?: Record<string, unknown>): Promise<T[]>;
  execute(sql: string, params?: Record<string, unknown>): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// ── SQL Server driver (mssql) ─────────────────────────────────────────────────
class MssqlDriver implements DbDriver {
  private pool: import('mssql').ConnectionPool | null = null;

  async connect(): Promise<void> {
    if (this.pool?.connected) return;
    const sqlMod = await import('mssql');
    const sql = (sqlMod as any).default ?? sqlMod;
    const cfg: import('mssql').config = {
      server:   config.db.host,
      port:     config.db.port,
      database: config.db.name,
      user:     config.db.user,
      password: config.db.password,
      options:  { encrypt: true, trustServerCertificate: true },
      pool:     { max: 20, min: 0, idleTimeoutMillis: 30_000 },
    };
    logger.info(`[MSSQL] Connecting to ${config.db.host}:${config.db.port}/${config.db.name}`);
    this.pool = await sql.connect(cfg) as import('mssql').ConnectionPool;
    logger.info('[MSSQL] Connection established');
  }

  async query<T>(queryText: string, params?: Record<string, unknown>): Promise<T[]> {
    await this.connect();
    const req = this.pool!.request();
    if (params) Object.entries(params).forEach(([k, v]) => req.input(k, v));
    const result = await req.query(queryText);
    return result.recordset as T[];
  }

  async execute(queryText: string, params?: Record<string, unknown>): Promise<void> {
    await this.connect();
    const req = this.pool!.request();
    if (params) Object.entries(params).forEach(([k, v]) => req.input(k, v));
    await req.query(queryText);
  }

  async disconnect(): Promise<void> {
    if (this.pool?.connected) {
      await this.pool.close();
      logger.info('[MSSQL] Connection closed');
    }
  }

  isConnected(): boolean {
    return this.pool?.connected ?? false;
  }
}

// ── Oracle driver (oracledb) ──────────────────────────────────────────────────
class OracleDriver implements DbDriver {
  private conn: import('oracledb').Connection | null = null;

  private buildConnectString(): string {
    // Accepts either a full connect string from DB_NAME or builds one from host/port/name
    const name = config.db.name;
    if (name.includes('/') || name.includes('(')) return name;   // already a full DSN
    return `${config.db.host}:${config.db.port}/${name}`;
  }

  async connect(): Promise<void> {
    if (this.conn) return;
    const oracledb = await import('oracledb');
    oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
    const connectString = this.buildConnectString();
    logger.info(`[Oracle] Connecting to ${connectString}`);
    this.conn = await oracledb.getConnection({
      user:          config.db.user,
      password:      config.db.password,
      connectString,
    });
    logger.info('[Oracle] Connection established');
  }

  async query<T>(queryText: string, params?: Record<string, unknown>): Promise<T[]> {
    await this.connect();
    // Convert named params :key → oracledb bindParams object
    const binds: Record<string, unknown> = params ?? {};
    const result = await this.conn!.execute<T>(queryText, binds as import('oracledb').BindParameters, { outFormat: 2 });
    return (result.rows ?? []) as T[];
  }

  async execute(queryText: string, params?: Record<string, unknown>): Promise<void> {
    await this.connect();
    await this.conn!.execute(queryText, (params ?? {}) as import('oracledb').BindParameters, { autoCommit: true });
  }

  async disconnect(): Promise<void> {
    if (this.conn) {
      await this.conn.close();
      this.conn = null;
      logger.info('[Oracle] Connection closed');
    }
  }

  isConnected(): boolean {
    return this.conn !== null;
  }
}

// ── Public facade — dialect-transparent ──────────────────────────────────────
export class DatabaseConnectionManager {
  private readonly driver: DbDriver;
  private readonly dialect: Dialect;

  constructor() {
    this.dialect = config.db.dialect as Dialect;
    this.driver  = this.dialect === 'oracle' ? new OracleDriver() : new MssqlDriver();
    logger.info(`[DB] Dialect: ${this.dialect.toUpperCase()} | Bank: ${config.bank.bankCode}`);
  }

  async connect(): Promise<void> {
    if (!config.db.host) return;
    if (this.dialect === 'mssql') await (this.driver as MssqlDriver).connect();
    if (this.dialect === 'oracle') await (this.driver as OracleDriver).connect();
  }

  async query<T>(sql: string, params?: Record<string, unknown>): Promise<T[]> {
    return this.driver.query<T>(sql, params);
  }

  async queryOne<T>(sql: string, params?: Record<string, unknown>): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  async execute(sql: string, params?: Record<string, unknown>): Promise<void> {
    return this.driver.execute(sql, params);
  }

  async disconnect(): Promise<void> {
    await this.driver.disconnect();
  }

  isConnected(): boolean {
    return this.driver.isConnected();
  }

  getDialect(): Dialect {
    return this.dialect;
  }
}
