/**
 * CBS Business Coverage Tracking — Type Definitions
 */

// ── Coverage Grade ─────────────────────────────────────────────────────────────

export type CoverageGrade = 'GREEN' | 'AMBER' | 'RED';

export function gradeOf(pct: number): CoverageGrade {
  if (pct >= 90) return 'GREEN';
  if (pct >= 70) return 'AMBER';
  return 'RED';
}

// ── Raw scan result per module ─────────────────────────────────────────────────

export interface ModuleScanResult {
  moduleName:       string;
  modulePath:       string;
  pageFiles:        string[];
  workflowFiles:    string[];
  validatorFiles:   string[];
  repositoryFiles:  string[];
  smokeSpecFiles:   string[];
  sanitySpecFiles:  string[];
  regressionSpecFiles: string[];
  e2eSpecFiles:     string[];
}

// ── Test counts extracted from spec files ─────────────────────────────────────

export interface SpecCounts {
  smoke:      number;
  sanity:     number;
  regression: number;
  e2e:        number;
}

// ── Core coverage model (matches requirement interface) ────────────────────────

export interface ModuleCoverage {
  moduleName:         string;

  // Screens
  totalScreens:       number;
  automatedScreens:   number;
  screenCoverage:     number;
  screenGrade:        CoverageGrade;

  // Workflows
  totalWorkflows:     number;
  automatedWorkflows: number;
  workflowCoverage:   number;
  workflowGrade:      CoverageGrade;

  // Tests
  smokeTests:         number;
  sanityTests:        number;
  regressionTests:    number;
  e2eTests:           number;
  totalTests:         number;

  // Validators & Repositories
  validators:         number;
  repositories:       number;

  // Overall
  overallCoverage:    number;
  overallGrade:       CoverageGrade;

  // Meta
  scannedAt:          string;
}

// ── Dashboard summary ──────────────────────────────────────────────────────────

export interface CoverageDashboardModel {
  generatedAt:       string;
  frameworkVersion:  string;
  totalModules:      number;
  totalScreens:      number;
  automatedScreens:  number;
  totalTests:        number;
  overallCoverage:   number;
  overallGrade:      CoverageGrade;
  modules:           ModuleCoverage[];
  topCovered:        ModuleCoverage[];
  leastCovered:      ModuleCoverage[];
  trend:             CoverageTrend;
}

// ── History / Trend ────────────────────────────────────────────────────────────

export interface CoverageSnapshot {
  date:            string;   // YYYY-MM-DD
  overallCoverage: number;
  totalModules:    number;
  totalTests:      number;
  totalScreens:    number;
  automatedScreens: number;
  byModule:        Record<string, number>;  // moduleName → overallCoverage
}

export interface CoverageTrend {
  history:          CoverageSnapshot[];
  previous:         CoverageSnapshot | null;
  current:          number;
  growthPct:        number;
  direction:        'UP' | 'DOWN' | 'STABLE';
}
