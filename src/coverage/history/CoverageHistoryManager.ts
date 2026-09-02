import * as fs   from 'fs';
import * as path from 'path';
import { CoverageSnapshot, CoverageTrend, CoverageDashboardModel } from '../CoverageSchema';

const HISTORY_DIR = path.join(process.cwd(), 'coverage', 'history');

export class CoverageHistoryManager {

  static save(model: CoverageDashboardModel): void {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
    const date     = new Date().toISOString().slice(0, 10);
    const snapshot = this.toSnapshot(model, date);
    const file     = path.join(HISTORY_DIR, `coverage-${date}.json`);
    fs.writeFileSync(file, JSON.stringify(snapshot, null, 2));
  }

  static loadAll(): CoverageSnapshot[] {
    if (!fs.existsSync(HISTORY_DIR)) return [];
    return fs.readdirSync(HISTORY_DIR)
      .filter(f => f.startsWith('coverage-') && f.endsWith('.json'))
      .sort()
      .map(f => {
        try { return JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, f), 'utf-8')) as CoverageSnapshot; }
        catch { return null; }
      })
      .filter((s): s is CoverageSnapshot => s !== null);
  }

  static buildTrend(currentCoverage: number, model: CoverageDashboardModel): CoverageTrend {
    const history  = this.loadAll();
    const previous = history.length > 0 ? history[history.length - 1] : null;
    const growth   = previous
      ? Math.round((currentCoverage - previous.overallCoverage) * 10) / 10
      : 0;

    return {
      history,
      previous,
      current:   currentCoverage,
      growthPct: growth,
      direction: growth > 0 ? 'UP' : growth < 0 ? 'DOWN' : 'STABLE',
    };
  }

  private static toSnapshot(model: CoverageDashboardModel, date: string): CoverageSnapshot {
    const byModule: Record<string, number> = {};
    model.modules.forEach(m => { byModule[m.moduleName] = m.overallCoverage; });
    return {
      date,
      overallCoverage:  model.overallCoverage,
      totalModules:     model.totalModules,
      totalTests:       model.totalTests,
      totalScreens:     model.totalScreens,
      automatedScreens: model.automatedScreens,
      byModule,
    };
  }
}
