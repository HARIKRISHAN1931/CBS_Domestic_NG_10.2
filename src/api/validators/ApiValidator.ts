import { expect } from '@playwright/test';
import { ApiResponse } from '../client/ApiClient';
import { logger } from '../../framework/logger/logger';

export class ApiValidator<T extends Record<string, unknown> = Record<string, unknown>> {
  constructor(
    private readonly res: ApiResponse<T>,
    private readonly label: string,
  ) {}

  status(expected: number): this {
    expect(this.res.status, `[API] ${this.label} — HTTP status`).toBe(expected);
    logger.api(`${this.label} status ${this.res.status} ✓`);
    return this;
  }

  ok():      this { return this.status(200); }
  created(): this { return this.status(201); }

  field(key: keyof T, expected: unknown): this {
    expect(this.res.body[key], `[API] ${this.label}.${String(key)}`).toBe(expected);
    logger.api(`${this.label}.${String(key)} = "${String(this.res.body[key])}" ✓`);
    return this;
  }

  fieldExists(key: keyof T): this {
    expect(this.res.body[key], `[API] ${this.label}.${String(key)} should exist`).toBeTruthy();
    logger.api(`${this.label}.${String(key)} exists ✓`);
    return this;
  }

  fieldContains(key: keyof T, substring: string): this {
    const val = String(this.res.body[key] ?? '');
    expect(val, `[API] ${this.label}.${String(key)} should contain "${substring}"`).toContain(substring);
    return this;
  }

  bodyContains(substring: string): this {
    expect(JSON.stringify(this.res.body)).toContain(substring);
    return this;
  }

  headerExists(name: string): this {
    expect(this.res.headers[name.toLowerCase()], `[API] header "${name}" should exist`).toBeTruthy();
    return this;
  }
}
