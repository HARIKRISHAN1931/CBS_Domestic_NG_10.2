import { logger } from '../../src/framework/logger/logger';
import { ValidationResult } from '../../src/common/types/domain.types';

export interface VoucherEntry {
  accountNo:   string;
  debitAmount: number;
  creditAmount: number;
  narration?:  string;
}

/**
 * Validates double-entry bookkeeping: total debits must equal total credits.
 */
export class VoucherValidator {
  private failures: string[] = [];

  validateDoubleEntry(entries: VoucherEntry[]): this {
    const totalDebit  = entries.reduce((s, e) => s + e.debitAmount, 0);
    const totalCredit = entries.reduce((s, e) => s + e.creditAmount, 0);
    const diff        = Math.abs(totalDebit - totalCredit);

    if (diff > 0.01) {
      this.failures.push(`Double-entry imbalance: Debit=${totalDebit.toFixed(2)}, Credit=${totalCredit.toFixed(2)}`);
    } else {
      logger.pass(`Double-entry balanced: ${totalDebit.toFixed(2)} ✓`);
    }
    return this;
  }

  validateVoucherAmount(expected: number, actual: number, label = 'Voucher'): this {
    const diff = Math.abs(expected - actual);
    if (diff > 0.01) {
      this.failures.push(`${label} amount mismatch: expected=${expected.toFixed(2)}, actual=${actual.toFixed(2)}`);
    } else {
      logger.pass(`${label} amount validated: ${actual.toFixed(2)} ✓`);
    }
    return this;
  }

  validateGLPosting(uiAmount: number, dbAmount: number): this {
    const diff = Math.abs(uiAmount - dbAmount);
    if (diff > 0.01) {
      this.failures.push(`GL posting mismatch: UI=${uiAmount.toFixed(2)}, DB=${dbAmount.toFixed(2)}`);
    } else {
      logger.pass(`GL posting validated ✓`);
    }
    return this;
  }

  assert(): ValidationResult {
    const result: ValidationResult = { passed: this.failures.length === 0, failures: this.failures };
    if (!result.passed) throw new Error(`VoucherValidator failures:\n${this.failures.join('\n')}`);
    return result;
  }
}
