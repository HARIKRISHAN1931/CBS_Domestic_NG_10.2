import * as fs from 'fs';
import * as path from 'path';

export interface ExecutionMetric {
  testName:   string;
  module:     string;
  status:     'passed' | 'failed' | 'skipped';
  duration:   number;
  timestamp:  string;
  tags:       string[];
  error?:     string;
}

export interface FailureAnalytic {
  testName:   string;
  module:     string;
  failCount:  number;
  lastError:  string;
  lastFailed: string;
}

const METRICS_FILE  = path.join(process.cwd(), 'dashboards', 'execution', 'metrics.jsonl');
const FAILURES_FILE = path.join(process.cwd(), 'dashboards', 'execution', 'failures.json');

export const ExecutionMonitor = {
  record(metric: Omit<ExecutionMetric, 'timestamp'>): void {
    const dir = path.dirname(METRICS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const entry: ExecutionMetric = { ...metric, timestamp: new Date().toISOString() };
    fs.appendFileSync(METRICS_FILE, JSON.stringify(entry) + '\n');

    if (metric.status === 'failed') {
      const failures: FailureAnalytic[] = fs.existsSync(FAILURES_FILE)
        ? JSON.parse(fs.readFileSync(FAILURES_FILE, 'utf-8'))
        : [];
      const idx = failures.findIndex(f => f.testName === metric.testName);
      if (idx >= 0) {
        failures[idx].failCount++;
        failures[idx].lastError  = metric.error ?? '';
        failures[idx].lastFailed = entry.timestamp;
      } else {
        failures.push({
          testName:   metric.testName,
          module:     metric.module,
          failCount:  1,
          lastError:  metric.error ?? '',
          lastFailed: entry.timestamp,
        });
      }
      fs.writeFileSync(FAILURES_FILE, JSON.stringify(failures, null, 2));
    }
  },

  getTopFailures(limit = 10): FailureAnalytic[] {
    if (!fs.existsSync(FAILURES_FILE)) return [];
    const failures: FailureAnalytic[] = JSON.parse(fs.readFileSync(FAILURES_FILE, 'utf-8'));
    return failures.sort((a, b) => b.failCount - a.failCount).slice(0, limit);
  },
};
