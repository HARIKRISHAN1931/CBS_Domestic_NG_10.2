import { logger } from '../../src/framework/logger/logger';
import { ValidationResult } from '../../src/common/types/domain.types';

export interface NPARecord {
  loanAccountNo:  string;
  daysOverdue:    number;
  npaStatus:      string;
  npaCategory?:   string;
  provisionPct?:  number;
}

/**
 * Validates NPA classification per RBI norms:
 * Sub-standard: 90+ days overdue
 * Doubtful:     12+ months in sub-standard
 * Loss:         identified as loss by bank/auditor
 */
export class NPAValidator {
  private failures: string[] = [];

  validateNPAClassification(record: NPARecord): this {
    const { daysOverdue, npaStatus, npaCategory } = record;

    if (daysOverdue >= 90 && npaStatus !== 'N') {
      this.failures.push(`Account ${record.loanAccountNo}: ${daysOverdue} days overdue but npaStatus=${npaStatus}, expected N`);
    } else if (daysOverdue < 90 && npaStatus === 'N') {
      this.failures.push(`Account ${record.loanAccountNo}: ${daysOverdue} days overdue but incorrectly marked NPA`);
    } else {
      logger.pass(`NPA classification correct for ${record.loanAccountNo} ✓`);
    }

    if (npaStatus === 'N' && npaCategory) {
      if (daysOverdue >= 90 && daysOverdue < 365 && npaCategory !== 'SUB') {
        this.failures.push(`Expected SUB-STANDARD for ${record.loanAccountNo}, got ${npaCategory}`);
      } else if (daysOverdue >= 365 && npaCategory !== 'DBT') {
        this.failures.push(`Expected DOUBTFUL for ${record.loanAccountNo}, got ${npaCategory}`);
      }
    }
    return this;
  }

  validateProvision(record: NPARecord): this {
    const provisionMap: Record<string, number> = { SUB: 15, DBT: 25, LOSS: 100 };
    if (record.npaCategory && record.provisionPct !== undefined) {
      const expected = provisionMap[record.npaCategory] ?? 0;
      if (Math.abs(expected - record.provisionPct) > 0.01) {
        this.failures.push(`Provision mismatch for ${record.loanAccountNo}: expected=${expected}%, actual=${record.provisionPct}%`);
      } else {
        logger.pass(`Provision validated for ${record.loanAccountNo}: ${record.provisionPct}% ✓`);
      }
    }
    return this;
  }

  assert(): ValidationResult {
    const result: ValidationResult = { passed: this.failures.length === 0, failures: this.failures };
    if (!result.passed) throw new Error(`NPAValidator failures:\n${this.failures.join('\n')}`);
    return result;
  }
}
