import { ModuleScanResult, ModuleCoverage, CoverageGrade, gradeOf } from '../CoverageSchema';
import { SpecParser } from '../collectors/SpecParser';

/**
 * Converts raw ModuleScanResult into computed ModuleCoverage metrics.
 *
 * Coverage rules:
 *   screenCoverage   = (smokeTests > 0 ? automatedScreens : 0) / totalScreens × 100
 *   workflowCoverage = automatedWorkflows / max(totalWorkflows, 1) × 100
 *   overallCoverage  = weighted average: screens 40% + workflows 30% + tests 30%
 */
export class CoverageCalculator {

  // Expected workflows per screen (industry heuristic for CBS banking)
  private static readonly EXPECTED_WORKFLOWS_PER_SCREEN = 1.5;

  compute(scan: ModuleScanResult): ModuleCoverage {
    const now = new Date().toISOString();

    // ── Screens ──────────────────────────────────────────────────────────────
    const totalScreens     = scan.pageFiles.length;
    const smokeCount       = SpecParser.countTests(scan.smokeSpecFiles);
    const sanityCount      = SpecParser.countTests(scan.sanitySpecFiles);
    const regressionCount  = SpecParser.countTests(scan.regressionSpecFiles);
    const e2eCount         = SpecParser.countTests(scan.e2eSpecFiles);
    const totalTests       = smokeCount + sanityCount + regressionCount + e2eCount;

    // A screen is "automated" if it has at least one smoke spec file
    const automatedScreens = Math.min(scan.smokeSpecFiles.length, totalScreens);
    const screenCoverage   = totalScreens > 0
      ? Math.round((automatedScreens / totalScreens) * 100)
      : 0;

    // ── Workflows ─────────────────────────────────────────────────────────────
    const automatedWorkflows = scan.workflowFiles.length;
    const totalWorkflows     = Math.max(
      automatedWorkflows,
      Math.ceil(totalScreens * CoverageCalculator.EXPECTED_WORKFLOWS_PER_SCREEN),
    );
    const workflowCoverage   = totalWorkflows > 0
      ? Math.round((automatedWorkflows / totalWorkflows) * 100)
      : 0;

    // ── Test density score (0–100) ────────────────────────────────────────────
    // Heuristic: expect at least 3 tests per screen (smoke + regression + e2e)
    const expectedTests  = Math.max(totalScreens * 3, 1);
    const testScore      = Math.min(Math.round((totalTests / expectedTests) * 100), 100);

    // ── Overall (weighted) ────────────────────────────────────────────────────
    const overallCoverage = Math.round(
      screenCoverage   * 0.40 +
      workflowCoverage * 0.30 +
      testScore        * 0.30,
    );

    return {
      moduleName:         scan.moduleName,
      totalScreens,
      automatedScreens,
      screenCoverage,
      screenGrade:        gradeOf(screenCoverage),
      totalWorkflows,
      automatedWorkflows,
      workflowCoverage,
      workflowGrade:      gradeOf(workflowCoverage),
      smokeTests:         smokeCount,
      sanityTests:        sanityCount,
      regressionTests:    regressionCount,
      e2eTests:           e2eCount,
      totalTests,
      validators:         scan.validatorFiles.length,
      repositories:       scan.repositoryFiles.length,
      overallCoverage,
      overallGrade:       gradeOf(overallCoverage),
      scannedAt:          now,
    };
  }

  computeAll(scans: ModuleScanResult[]): ModuleCoverage[] {
    return scans.map(s => this.compute(s));
  }

  overallProjectCoverage(modules: ModuleCoverage[]): number {
    if (modules.length === 0) return 0;
    const sum = modules.reduce((acc, m) => acc + m.overallCoverage, 0);
    return Math.round(sum / modules.length);
  }

  topCovered(modules: ModuleCoverage[], n = 5): ModuleCoverage[] {
    return [...modules]
      .sort((a, b) => b.overallCoverage - a.overallCoverage)
      .slice(0, n);
  }

  leastCovered(modules: ModuleCoverage[], n = 5): ModuleCoverage[] {
    return [...modules]
      .sort((a, b) => a.overallCoverage - b.overallCoverage)
      .slice(0, n);
  }
}
