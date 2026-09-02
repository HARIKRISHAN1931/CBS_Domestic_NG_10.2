import { expect } from '@playwright/test';
import { logger } from '../../src/framework/logger/logger';
import { ValidationResult } from '../../src/common/types/domain.types';

/**
 * Validates interest calculations across UI, API, and DB layers.
 * Formula: SI = P × R × T / 100
 */
export class InterestValidator {
  private failures: string[] = [];

  validateSimpleInterest(principal: number, rate: number, tenureMonths: number, actual: number): this {
    const expected = (principal * rate * tenureMonths) / (100 * 12);
    const diff     = Math.abs(expected - actual);
    if (diff > 1) {
      this.failures.push(`Interest mismatch: expected=${expected.toFixed(2)}, actual=${actual.toFixed(2)}`);
    } else {
      logger.pass(`Interest validated: ${actual.toFixed(2)} ✓`);
    }
    return this;
  }

  validateMaturityAmount(principal: number, interest: number, actualMaturity: number): this {
    const expected = principal + interest;
    const diff     = Math.abs(expected - actualMaturity);
    if (diff > 1) {
      this.failures.push(`Maturity amount mismatch: expected=${expected.toFixed(2)}, actual=${actualMaturity.toFixed(2)}`);
    } else {
      logger.pass(`Maturity amount validated: ${actualMaturity.toFixed(2)} ✓`);
    }
    return this;
  }

  validateUiVsDb(uiInterest: number, dbInterest: number): this {
    const diff = Math.abs(uiInterest - dbInterest);
    if (diff > 1) {
      this.failures.push(`UI vs DB interest mismatch: UI=${uiInterest}, DB=${dbInterest}`);
    } else {
      logger.pass(`UI vs DB interest match ✓`);
    }
    return this;
  }

  assert(): ValidationResult {
    const result: ValidationResult = { passed: this.failures.length === 0, failures: this.failures };
    if (!result.passed) {
      throw new Error(`InterestValidator failures:\n${this.failures.join('\n')}`);
    }
    return result;
  }
}
