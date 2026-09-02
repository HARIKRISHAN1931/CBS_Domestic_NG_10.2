import { expect } from '@playwright/test';
import { logger } from '../../framework/logger/logger';

type DbRow = Record<string, unknown> | null | undefined;

export class DatabaseValidator {
  constructor(
    private readonly row: DbRow,
    private readonly label: string
  ) {}

  exists(): this {
    expect(this.row, `[DB] ${this.label} — record should exist`).toBeTruthy();
    logger.db(`${this.label} — exists ✓`);
    return this;
  }

  absent(): this {
    expect(this.row, `[DB] ${this.label} — record should NOT exist`).toBeFalsy();
    logger.db(`${this.label} — correctly absent ✓`);
    return this;
  }

  field(column: string, expected: string | number): this {
    this.exists();
    if (expected === undefined || expected === '') return this;
    const actual = String((this.row as Record<string, unknown>)[column] ?? '').trim();
    expect(actual, `[DB] ${this.label}.${column}`).toBe(String(expected).trim());
    logger.db(`${this.label}.${column} = "${actual}" ✓`);
    return this;
  }

  fieldNotEmpty(column: string): this {
    this.exists();
    const val = String((this.row as Record<string, unknown>)[column] ?? '').trim();
    expect(val, `[DB] ${this.label}.${column} should not be empty`).toBeTruthy();
    logger.db(`${this.label}.${column} = "${val}" (not empty) ✓`);
    return this;
  }

  fieldPositive(column: string): this {
    this.exists();
    const val = Number((this.row as Record<string, unknown>)[column] ?? 0);
    expect(val, `[DB] ${this.label}.${column} should be positive`).toBeGreaterThan(0);
    logger.db(`${this.label}.${column} = ${val} (positive) ✓`);
    return this;
  }

  fieldContains(column: string, substring: string): this {
    this.exists();
    const val = String((this.row as Record<string, unknown>)[column] ?? '').trim();
    expect(val, `[DB] ${this.label}.${column} should contain "${substring}"`).toContain(substring);
    logger.db(`${this.label}.${column} contains "${substring}" ✓`);
    return this;
  }

  authStatus(expected: 'P' | 'A' | 'R' | 'U' | string): this {
    return this.field('authStatus', expected);
  }

  isActive(expected: 0 | 1 = 1): this {
    return this.field('isActive', expected);
  }

  matchesUi(uiValues: Record<string, string>, fieldMap: Record<string, string>): this {
    this.exists();
    const diffs: string[] = [];
    for (const [uiKey, dbCol] of Object.entries(fieldMap)) {
      const uiVal = (uiValues[uiKey] ?? '').toString().trim();
      const dbVal = ((this.row as Record<string, unknown>)[dbCol] ?? '').toString().trim();
      if (uiVal && dbVal && uiVal !== dbVal) {
        diffs.push(`${uiKey}: UI="${uiVal}" ≠ DB[${dbCol}]="${dbVal}"`);
      }
    }
    if (diffs.length > 0) throw new Error(`[DB] ${this.label} — UI vs DB mismatches:\n  ${diffs.join('\n  ')}`);
    logger.db(`${this.label} — all UI fields match DB ✓`);
    return this;
  }
}
