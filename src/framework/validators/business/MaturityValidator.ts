import { logger } from '../../logger/logger';
import { ValidationResult } from '../../../common/types/domain.types';

/**
 * Validates TD maturity calculations and status transitions.
 */
export class MaturityValidator {
  private failures: string[] = [];

  validateMaturityDate(openDate: string, tenureMonths: number, actualMaturityDate: string): this {
    const open     = new Date(openDate);
    const expected = new Date(open);
    expected.setMonth(expected.getMonth() + tenureMonths);
    const actual   = new Date(actualMaturityDate);
    const diffDays = Math.abs((expected.getTime() - actual.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays > 1) {
      this.failures.push(`Maturity date mismatch: expected=${expected.toDateString()}, actual=${actual.toDateString()}`);
    } else {
      logger.pass(`Maturity date validated: ${actualMaturityDate} ✓`);
    }
    return this;
  }

  validateMaturityAmount(principal: number, interest: number, actualAmount: number): this {
    const expected = principal + interest;
    const diff     = Math.abs(expected - actualAmount);
    if (diff > 1) {
      this.failures.push(`Maturity amount mismatch: expected=${expected.toFixed(2)}, actual=${actualAmount.toFixed(2)}`);
    } else {
      logger.pass(`Maturity amount validated: ${actualAmount.toFixed(2)} ✓`);
    }
    return this;
  }

  validateStatusTransition(currentStatus: string, expectedStatus: string, tdAccountNo: string): this {
    if (currentStatus !== expectedStatus) {
      this.failures.push(`TD ${tdAccountNo} status: expected=${expectedStatus}, actual=${currentStatus}`);
    } else {
      logger.pass(`TD ${tdAccountNo} status transition validated: ${currentStatus} ✓`);
    }
    return this;
  }

  assert(): ValidationResult {
    const result: ValidationResult = { passed: this.failures.length === 0, failures: this.failures };
    if (!result.passed) throw new Error(`MaturityValidator failures:\n${this.failures.join('\n')}`);
    return result;
  }
}
