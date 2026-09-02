import { logger } from '../../logger/logger';
import { ValidationResult } from '../../../common/types/domain.types';

export interface SIRecord {
  siId:          string;
  fromAccount:   string;
  toAccount:     string;
  amount:        number;
  frequency:     string;
  nextDueDate:   string;
  status:        string;
}

/**
 * Validates Standing Instruction (SI) execution and scheduling.
 */
export class SIValidator {
  private failures: string[] = [];

  validateSIExecution(si: SIRecord, executedAmount: number, executionDate: string): this {
    if (Math.abs(si.amount - executedAmount) > 0.01) {
      this.failures.push(`SI ${si.siId} amount mismatch: expected=${si.amount}, executed=${executedAmount}`);
    } else {
      logger.pass(`SI ${si.siId} amount validated ✓`);
    }

    const due    = new Date(si.nextDueDate);
    const actual = new Date(executionDate);
    const diff   = Math.abs(due.getTime() - actual.getTime()) / (1000 * 60 * 60 * 24);
    if (diff > 1) {
      this.failures.push(`SI ${si.siId} execution date mismatch: due=${si.nextDueDate}, executed=${executionDate}`);
    } else {
      logger.pass(`SI ${si.siId} execution date validated ✓`);
    }
    return this;
  }

  validateNextDueDate(si: SIRecord, actualNextDue: string): this {
    const frequencyDays: Record<string, number> = {
      DAILY: 1, WEEKLY: 7, MONTHLY: 30, QUARTERLY: 90, YEARLY: 365,
    };
    const days     = frequencyDays[si.frequency.toUpperCase()] ?? 30;
    const current  = new Date(si.nextDueDate);
    const expected = new Date(current);
    expected.setDate(expected.getDate() + days);
    const actual   = new Date(actualNextDue);
    const diff     = Math.abs(expected.getTime() - actual.getTime()) / (1000 * 60 * 60 * 24);

    if (diff > 1) {
      this.failures.push(`SI ${si.siId} next due date mismatch: expected=${expected.toDateString()}, actual=${actual.toDateString()}`);
    } else {
      logger.pass(`SI ${si.siId} next due date validated ✓`);
    }
    return this;
  }

  assert(): ValidationResult {
    const result: ValidationResult = { passed: this.failures.length === 0, failures: this.failures };
    if (!result.passed) throw new Error(`SIValidator failures:\n${this.failures.join('\n')}`);
    return result;
  }
}
