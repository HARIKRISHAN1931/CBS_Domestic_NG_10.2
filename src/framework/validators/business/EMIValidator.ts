import { logger } from '../../logger/logger';
import { ValidationResult } from '../../../common/types/domain.types';

/**
 * Validates EMI calculations using reducing balance method.
 * EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 */
export class EMIValidator {
  private failures: string[] = [];

  calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
    const r   = annualRate / (12 * 100);
    const n   = tenureMonths;
    if (r === 0) return principal / n;
    return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  validateEMI(principal: number, annualRate: number, tenureMonths: number, actualEMI: number): this {
    const expected = this.calculateEMI(principal, annualRate, tenureMonths);
    const diff     = Math.abs(expected - actualEMI);
    if (diff > 2) {
      this.failures.push(`EMI mismatch: expected=${expected.toFixed(2)}, actual=${actualEMI.toFixed(2)}`);
    } else {
      logger.pass(`EMI validated: ${actualEMI.toFixed(2)} ✓`);
    }
    return this;
  }

  validateTotalRepayment(emi: number, tenureMonths: number, principal: number, actualTotal: number): this {
    const expectedTotal    = emi * tenureMonths;
    const expectedInterest = expectedTotal - principal;
    const diff             = Math.abs(expectedTotal - actualTotal);
    if (diff > 10) {
      this.failures.push(`Total repayment mismatch: expected=${expectedTotal.toFixed(2)}, actual=${actualTotal.toFixed(2)}`);
    } else {
      logger.pass(`Total repayment validated. Interest component: ${expectedInterest.toFixed(2)} ✓`);
    }
    return this;
  }

  validateUiVsDb(uiEMI: number, dbEMI: number): this {
    const diff = Math.abs(uiEMI - dbEMI);
    if (diff > 2) {
      this.failures.push(`UI vs DB EMI mismatch: UI=${uiEMI}, DB=${dbEMI}`);
    } else {
      logger.pass(`UI vs DB EMI match ✓`);
    }
    return this;
  }

  assert(): ValidationResult {
    const result: ValidationResult = { passed: this.failures.length === 0, failures: this.failures };
    if (!result.passed) throw new Error(`EMIValidator failures:\n${this.failures.join('\n')}`);
    return result;
  }
}
