import * as fs   from 'fs';
import * as path from 'path';
import { ModuleScanResult } from '../CoverageSchema';

/**
 * Scans src/modules/* and extracts raw file counts per module.
 * Pure filesystem reads — no test execution required.
 */
export class CoverageCollector {

  private readonly modulesRoot: string;

  // Modules that are framework scaffolding, not business modules
  private static readonly SKIP_DIRS = new Set(['sanity']);

  constructor(modulesRoot?: string) {
    this.modulesRoot = modulesRoot ?? path.join(process.cwd(), 'src', 'modules');
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  collectAll(): ModuleScanResult[] {
    if (!fs.existsSync(this.modulesRoot)) {
      throw new Error(`Modules root not found: ${this.modulesRoot}`);
    }

    return fs.readdirSync(this.modulesRoot, { withFileTypes: true })
      .filter(d => d.isDirectory() && !CoverageCollector.SKIP_DIRS.has(d.name))
      .map(d => this.scanModule(d.name, path.join(this.modulesRoot, d.name)))
      .filter(m => m.pageFiles.length > 0 || m.smokeSpecFiles.length > 0);
  }

  collectOne(moduleName: string): ModuleScanResult {
    const modulePath = path.join(this.modulesRoot, moduleName);
    if (!fs.existsSync(modulePath)) {
      throw new Error(`Module not found: ${modulePath}`);
    }
    return this.scanModule(moduleName, modulePath);
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  private scanModule(name: string, modulePath: string): ModuleScanResult {
    return {
      moduleName:          name,
      modulePath,
      pageFiles:           this.glob(modulePath, 'pages',       /Page\.ts$/),
      workflowFiles:       this.glob(modulePath, 'workflows',   /Workflow\.ts$/),
      validatorFiles:      this.glob(modulePath, 'validators',  /Validator\.ts$/),
      repositoryFiles:     this.glob(modulePath, 'repositories',/Repository\.ts$/),
      smokeSpecFiles:      this.glob(modulePath, 'tests/smoke',      /\.spec\.ts$/),
      sanitySpecFiles:     this.glob(modulePath, 'tests/sanity',     /\.spec\.ts$/),
      regressionSpecFiles: this.glob(modulePath, 'tests/regression', /\.spec\.ts$/),
      e2eSpecFiles:        this.glob(modulePath, 'tests/e2e',        /\.spec\.ts$/),
    };
  }

  private glob(base: string, subDir: string, pattern: RegExp): string[] {
    const dir = path.join(base, subDir);
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir, { withFileTypes: true })
      .filter(f => f.isFile() && pattern.test(f.name))
      .map(f => path.join(dir, f.name));
  }
}
