import * as path from 'path';
import { CoverageCollector }        from './collectors/CoverageCollector';
import { CoverageCalculator }       from './calculators/CoverageCalculator';
import { CoverageHistoryManager }   from './history/CoverageHistoryManager';
import { CoverageReportGenerator }  from './generators/CoverageReportGenerator';
import { CoverageDashboardModel, gradeOf } from './CoverageSchema';

/**
 * Main orchestrator for the Business Coverage Tracking Dashboard.
 *
 * Usage (programmatic):
 *   const dashboard = new CoverageDashboard();
 *   const model = dashboard.run();
 *
 * Usage (CLI):
 *   npm run coverage:business
 */
export class CoverageDashboard {

  private readonly collector:  CoverageCollector;
  private readonly calculator: CoverageCalculator;

  constructor(modulesRoot?: string) {
    this.collector  = new CoverageCollector(modulesRoot);
    this.calculator = new CoverageCalculator();
  }

  run(): CoverageDashboardModel {
    // 1. Scan filesystem
    const scans   = this.collector.collectAll();

    // 2. Compute metrics
    const modules = this.calculator.computeAll(scans);
    const overall = this.calculator.overallProjectCoverage(modules);

    // 3. Build model
    const model: CoverageDashboardModel = {
      generatedAt:      new Date().toISOString(),
      frameworkVersion: '10.2',
      totalModules:     modules.length,
      totalScreens:     modules.reduce((s, m) => s + m.totalScreens, 0),
      automatedScreens: modules.reduce((s, m) => s + m.automatedScreens, 0),
      totalTests:       modules.reduce((s, m) => s + m.totalTests, 0),
      overallCoverage:  overall,
      overallGrade:     gradeOf(overall),
      modules,
      topCovered:       this.calculator.topCovered(modules, 5),
      leastCovered:     this.calculator.leastCovered(modules, 5),
      trend:            CoverageHistoryManager.buildTrend(overall, { modules } as CoverageDashboardModel),
    };

    // 4. Persist history snapshot
    CoverageHistoryManager.save(model);

    // 5. Generate reports
    const { htmlPath, jsonPath } = CoverageReportGenerator.generate(model);

    // 6. Console summary
    this.printSummary(model, htmlPath, jsonPath);

    return model;
  }

  private printSummary(m: CoverageDashboardModel, html: string, json: string): void {
    const line = '═'.repeat(52);
    console.log(`\n╔${line}╗`);
    console.log(`║  CBS Business Coverage Dashboard${' '.repeat(19)}║`);
    console.log(`╠${line}╣`);
    console.log(`║  Overall Coverage : ${String(m.overallCoverage + '%').padEnd(31)}║`);
    console.log(`║  Grade            : ${String(m.overallGrade).padEnd(31)}║`);
    console.log(`║  Modules Scanned  : ${String(m.totalModules).padEnd(31)}║`);
    console.log(`║  Total Screens    : ${String(m.totalScreens).padEnd(31)}║`);
    console.log(`║  Automated Screens: ${String(m.automatedScreens).padEnd(31)}║`);
    console.log(`║  Total Tests      : ${String(m.totalTests).padEnd(31)}║`);
    console.log(`╠${line}╣`);
    console.log(`║  Trend: ${String(m.trend.direction + ' ' + (m.trend.growthPct >= 0 ? '+' : '') + m.trend.growthPct + '%').padEnd(43)}║`);
    console.log(`╠${line}╣`);
    console.log(`║  HTML → ${html.slice(-43).padEnd(43)}║`);
    console.log(`║  JSON → ${json.slice(-43).padEnd(43)}║`);
    console.log(`╚${line}╝\n`);

    console.log('📦 Module Coverage:');
    m.modules
      .sort((a, b) => b.overallCoverage - a.overallCoverage)
      .forEach(mod => {
        const icon = mod.overallGrade === 'GREEN' ? '🟢' : mod.overallGrade === 'AMBER' ? '🟡' : '🔴';
        console.log(`  ${icon} ${mod.moduleName.padEnd(20)} ${String(mod.overallCoverage + '%').padStart(5)}  (screens:${mod.screenCoverage}% wf:${mod.workflowCoverage}% tests:${mod.totalTests})`);
      });
    console.log('');
  }
}
