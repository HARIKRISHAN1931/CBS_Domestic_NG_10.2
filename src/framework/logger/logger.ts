import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type LogLevel = 'INFO' | 'OK' | 'ERR' | 'WARN' | 'DB' | 'UI' | 'STEP' | 'API' | 'PERF';

const EMOJI: Record<LogLevel, string> = {
  INFO: 'ℹ️ ', OK: '✅', ERR: '❌', WARN: '⚠️ ',
  DB: '🗄️ ', UI: '🖥️ ', STEP: '▶️ ', API: '🌐', PERF: '⏱️ ',
};

const LOGS_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOGS_DIR)) fs.mkdirSync(LOGS_DIR, { recursive: true });

const RUN_TS  = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const LOG_FILE = process.env.CBS_LOG_FILE ?? path.join(LOGS_DIR, `test-run-${RUN_TS}.log`);
const stream   = fs.createWriteStream(LOG_FILE, { flags: 'a' });

function emit(level: LogLevel, message: string, detail?: unknown): void {
  const ts    = new Date().toISOString().slice(11, 23);
  const msg   = message.replace(/[\r\n\t]/g, ' ').trim();
  const extra = detail !== undefined ? ` | ${JSON.stringify(detail).replace(/[\r\n]/g, ' ')}` : '';
  process.stdout.write(`[${ts}] ${EMOJI[level]} [${level}] ${msg}${extra}\n`);
  stream.write(`[${new Date().toISOString()}] [${level}] ${msg}${extra}\n`);
}

export const logger = {
  info:  (msg: string, d?: unknown) => emit('INFO', msg, d),
  pass:  (msg: string, d?: unknown) => emit('OK',   msg, d),
  fail:  (msg: string, d?: unknown) => emit('ERR',  msg, d),
  warn:  (msg: string, d?: unknown) => emit('WARN', msg, d),
  db:    (msg: string, d?: unknown) => emit('DB',   msg, d),
  ui:    (msg: string, d?: unknown) => emit('UI',   msg, d),
  api:   (msg: string, d?: unknown) => emit('API',  msg, d),
  perf:  (msg: string, d?: unknown) => emit('PERF', msg, d),
  debug: (msg: string, d?: unknown) => { if (process.env.LOG_LEVEL === 'debug') emit('INFO', `[DEBUG] ${msg}`, d); },

  step: async (name: string, fn: () => Promise<void>): Promise<void> => {
    emit('STEP', name);
    await test.step(name, fn);
  },

  getLogFile: () => LOG_FILE,

  diffReport(
    label: string,
    uiValues: Record<string, string>,
    dbRecord: Record<string, unknown>,
    fieldMap: Record<string, string>
  ): string[] {
    const diffs: string[] = [];
    for (const [uiKey, dbCol] of Object.entries(fieldMap)) {
      const uiVal = (uiValues[uiKey] ?? '').toString().trim();
      const dbVal = (dbRecord[dbCol]  ?? '').toString().trim();
      if (uiVal !== dbVal) diffs.push(`${uiKey}: UI=[${uiVal}] DB=[${dbVal}]`);
    }
    diffs.length > 0
      ? emit('ERR', `[${label}] mismatches: ${diffs.join(' | ')}`)
      : emit('DB',  `[${label}] all fields match DB`);
    return diffs;
  },
};
