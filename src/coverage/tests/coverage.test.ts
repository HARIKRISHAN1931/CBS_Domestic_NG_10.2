/**
 * Unit tests for Coverage subsystem
 * Run: npx ts-node -e "require('./src/coverage/tests/coverage.test')"
 * Or integrate with your test runner.
 */
import * as assert from 'assert';
import * as fs     from 'fs';
import * as path   from 'path';
import * as os     from 'os';

import { CoverageCalculator }  from '../calculators/CoverageCalculator';
import { SpecParser }          from '../collectors/SpecParser';
import { gradeOf }             from '../CoverageSchema';
import { ModuleScanResult }    from '../CoverageSchema';

// ── Helpers ────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${name}: ${(e as Error).message}`);
    failed++;
  }
}

function eq<T>(actual: T, expected: T, msg?: string): void {
  assert.strictEqual(actual, expected, msg ?? `Expected ${expected}, got ${actual}`);
}

// ── gradeOf ────────────────────────────────────────────────────────────────────

console.log('\n📋 gradeOf()');
test('returns GREEN for 90',  () => eq(gradeOf(90),  'GREEN'));
test('returns GREEN for 100', () => eq(gradeOf(100), 'GREEN'));
test('returns AMBER for 70',  () => eq(gradeOf(70),  'AMBER'));
test('returns AMBER for 89',  () => eq(gradeOf(89),  'AMBER'));
test('returns RED for 69',    () => eq(gradeOf(69),  'RED'));
test('returns RED for 0',     () => eq(gradeOf(0),   'RED'));

// ── SpecParser ─────────────────────────────────────────────────────────────────

console.log('\n📋 SpecParser');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cbs-cov-'));
const spec1  = path.join(tmpDir, 'a.spec.ts');
const spec2  = path.join(tmpDir, 'b.spec.ts');

fs.writeFileSync(spec1, `
test.describe('Suite', () => {
  test('first test', async () => {});
  test('second test', async () => {});
  it('third test', async () => {});
});
`);
fs.writeFileSync(spec2, `
test('solo test', async () => {});
`);

test('counts 3 tests in spec1',       () => eq(SpecParser.countInFile(spec1), 3));
test('counts 1 test in spec2',        () => eq(SpecParser.countInFile(spec2), 1));
test('counts 4 tests across 2 files', () => eq(SpecParser.countTests([spec1, spec2]), 4));
test('returns 0 for missing file',    () => eq(SpecParser.countInFile('/nonexistent.ts'), 0));
test('extracts titles',               () => {
  const titles = SpecParser.extractTestTitles([spec1]);
  eq(titles.length, 3);
  eq(titles[0], 'first test');
});

// ── CoverageCalculator ─────────────────────────────────────────────────────────

console.log('\n📋 CoverageCalculator');

const calc = new CoverageCalculator();

const fullScan: ModuleScanResult = {
  moduleName:          'Customer',
  modulePath:          '/src/modules/Customer',
  pageFiles:           ['CustomerCreationPage.ts', 'CustomerInquiryPage.ts'],
  workflowFiles:       ['CustomerWorkflow.ts'],
  validatorFiles:      ['CustomerValidator.ts'],
  repositoryFiles:     ['CustomerRepository.ts'],
  smokeSpecFiles:      [spec1],
  sanitySpecFiles:     [],
  regressionSpecFiles: [spec2],
  e2eSpecFiles:        [],
};

const emptyScan: ModuleScanResult = {
  moduleName: 'Empty', modulePath: '/src/modules/Empty',
  pageFiles: [], workflowFiles: [], validatorFiles: [],
  repositoryFiles: [], smokeSpecFiles: [], sanitySpecFiles: [],
  regressionSpecFiles: [], e2eSpecFiles: [],
};

const result = calc.compute(fullScan);

test('moduleName preserved',          () => eq(result.moduleName, 'Customer'));
test('totalScreens = 2',              () => eq(result.totalScreens, 2));
test('automatedScreens = 1',          () => eq(result.automatedScreens, 1));
test('screenCoverage = 50',           () => eq(result.screenCoverage, 50));
test('screenGrade = RED',             () => eq(result.screenGrade, 'RED'));
test('automatedWorkflows = 1',        () => eq(result.automatedWorkflows, 1));
test('smokeTests = 3',                () => eq(result.smokeTests, 3));
test('regressionTests = 1',           () => eq(result.regressionTests, 1));
test('totalTests = 4',                () => eq(result.totalTests, 4));
test('validators = 1',                () => eq(result.validators, 1));
test('repositories = 1',              () => eq(result.repositories, 1));
test('overallCoverage is number',     () => eq(typeof result.overallCoverage, 'number'));
test('overallCoverage in 0-100',      () => assert.ok(result.overallCoverage >= 0 && result.overallCoverage <= 100));

const emptyResult = calc.compute(emptyScan);
test('empty module screenCoverage=0', () => eq(emptyResult.screenCoverage, 0));
test('empty module totalTests=0',     () => eq(emptyResult.totalTests, 0));

test('topCovered returns sorted desc', () => {
  const mods = calc.computeAll([fullScan, emptyScan]);
  const top  = calc.topCovered(mods, 2);
  assert.ok(top[0].overallCoverage >= top[1].overallCoverage);
});

test('leastCovered returns sorted asc', () => {
  const mods  = calc.computeAll([fullScan, emptyScan]);
  const least = calc.leastCovered(mods, 2);
  assert.ok(least[0].overallCoverage <= least[1].overallCoverage);
});

test('overallProjectCoverage is average', () => {
  const mods = calc.computeAll([fullScan, emptyScan]);
  const avg  = calc.overallProjectCoverage(mods);
  eq(avg, Math.round((mods[0].overallCoverage + mods[1].overallCoverage) / 2));
});

// ── Cleanup & Summary ──────────────────────────────────────────────────────────

fs.rmSync(tmpDir, { recursive: true, force: true });

console.log(`\n${'─'.repeat(40)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed > 0) {
  console.log('❌ Some tests failed');
  process.exit(1);
} else {
  console.log('✅ All tests passed');
}
