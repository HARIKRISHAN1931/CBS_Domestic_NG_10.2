import * as dotenv from 'dotenv';
import * as path from 'path';

// ── Resolve BANK + ENV ───────────────────────────────────────────────────────
// Usage:  set BANK=BDCC && set ENV=qa  && npm run test:smoke
//         set BANK=BDCC && set ENV=uat && npm run test:smoke
//         set BANK=BCCB && set ENV=qa  && npm run test:smoke
//         set BANK=BCCB && set ENV=uat && npm run test:smoke
// Defaults: BANK=BDCC, ENV=qa
const bank = (process.env.BANK || 'BDCC').trim().toUpperCase();
const env  = (process.env.ENV  || 'QA').trim().toUpperCase();

const validBanks = ['BDCC', 'BCCB'];
const validEnvs  = ['QA', 'UAT', 'SIT', 'PROD'];

if (!validBanks.includes(bank)) throw new Error(`Invalid BANK: "${bank}". Must be one of: ${validBanks.join(', ')}`);
if (!validEnvs.includes(env))   throw new Error(`Invalid ENV: "${env}". Must be one of: ${validEnvs.join(', ')}`);

// Loads .env.bdcc.qa / .env.bdcc.uat / .env.bccb.qa / .env.bccb.uat
dotenv.config({ path: path.resolve(process.cwd(), `.env.${bank.toLowerCase()}.${env.toLowerCase()}`) });

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

const optional = (key: string, fallback = ''): string => process.env[key] ?? fallback;

// ── Bank definitions ──────────────────────────────────────────────────────────
export interface BankConfig {
  bankCode:  string;
  bankName:  string;
  baseUrl:   string;
  tenantId:  string;
  appPath:   string;
  port:      number;
  dbDialect: 'mssql' | 'oracle';
}

export const BANKS: Record<string, BankConfig> = {
  BDCC: {
    bankCode:  'BDCC',
    bankName:  'Bagalkot District Central Co-operative Bank',
    baseUrl:   'http://172.21.0.39:8083',
    port:      8083,
    tenantId:  '139',
    appPath:   '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en',
    dbDialect: 'oracle',
  },
  BCCB: {
    bankCode:  'BCCB',
    bankName:  'Burdwan Central Co-operative Bank',
    baseUrl:   'http://172.21.0.39:7999',
    port:      7999,
    tenantId:  '139',                    // same tenant ID as BDCC
    appPath:   '/Kiya.aiCBS-10.2.0/LoginPage?tid=139&lang=en',
    dbDialect: 'mssql',
  },
};

// ── Active bank config ────────────────────────────────────────────────────────
const activeBank = BANKS[bank];

export const config = {
  env:     env as 'QA' | 'UAT' | 'SIT' | 'PROD',
  bank:    activeBank,
  banks:   BANKS,
  baseUrl: required('BASE_URL'),
  appPath: optional('CBS_APP_PATH', activeBank.appPath),
  logLevel: optional('LOG_LEVEL', 'info'),

  auth: {
    username:        required('MAKER_USERNAME'),
    password:        required('MAKER_PASSWORD'),
    checkerUsername: required('CHECKER_USERNAME'),
    checkerPassword: required('CHECKER_PASSWORD'),
  },

  db: {
    host:     optional('DB_HOST'),
    port:     Number(optional('DB_PORT', activeBank.dbDialect === 'oracle' ? '1521' : '1433')),
    name:     optional('DB_NAME'),
    user:     optional('DB_USER'),
    password: optional('DB_PASSWORD'),
    // dialect is fixed per bank — not overridable via env
    dialect:  activeBank.dbDialect,
  },

  api: {
    baseUrl: optional('API_BASE_URL'),
    timeout: Number(optional('API_TIMEOUT', '30000')),
  },
} as const;
